import { fetchEventsForRegion } from './historyApi';
import { geocodeEvents, type GeocodedEvent } from './geocodingService';

interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

interface LoadingState {
  isLoading: boolean;
  loadedRegions: Set<string>;
  pendingRequests: Set<string>;
}

class DynamicLoadingService {
  private loadingState: LoadingState = {
    isLoading: false,
    loadedRegions: new Set(),
    pendingRequests: new Set(),
  };

  private throttleTimeout: number | null = null;
  private readonly THROTTLE_DELAY = 2000; // 2 seconds between requests
  private readonly MIN_ZOOM_LEVEL = 2; // Minimum zoom level for dynamic loading

  /**
   * Check if we should load events for the current map bounds
   */
  shouldLoadEvents(bounds: MapBounds, zoomLevel: number): boolean {
    // Don't load if zoomed out too far
    if (zoomLevel < this.MIN_ZOOM_LEVEL) {
      return false;
    }

    // Don't load if already loading
    if (this.loadingState.isLoading) {
      return false;
    }

    // Generate region key for caching
    const regionKey = this.getRegionKey(bounds);
    
    // Don't load if already loaded or pending
    if (this.loadingState.loadedRegions.has(regionKey) || 
        this.loadingState.pendingRequests.has(regionKey)) {
      return false;
    }

    return true;
  }

  /**
   * Load events for a specific region with throttling
   */
  async loadEventsForRegion(
    bounds: MapBounds,
    yearRange: [number, number],
    onEventsLoaded: (events: GeocodedEvent[]) => void,
    onLoadingChange: (isLoading: boolean) => void
  ): Promise<void> {
    const regionKey = this.getRegionKey(bounds);

    // Mark as pending
    this.loadingState.pendingRequests.add(regionKey);
    onLoadingChange(true);

    // Clear existing throttle
    if (this.throttleTimeout) {
      clearTimeout(this.throttleTimeout);
    }

    // Throttle the request
    this.throttleTimeout = setTimeout(async () => {
      try {
        console.log(`Loading events for region: ${regionKey}`);
        
        // Fetch events for this region
        const events = await fetchEventsForRegion(bounds, yearRange);
        
        // Geocode the events
        const geocodedEvents = geocodeEvents(events);
        
        // Filter events that are actually within the bounds
        const filteredEvents = geocodedEvents.filter(event => 
          event.latitude >= bounds.south &&
          event.latitude <= bounds.north &&
          event.longitude >= bounds.west &&
          event.longitude <= bounds.east
        );

        // Mark region as loaded
        this.loadingState.loadedRegions.add(regionKey);
        this.loadingState.pendingRequests.delete(regionKey);

        // Notify callback
        onEventsLoaded(filteredEvents);
        
        console.log(`Loaded ${filteredEvents.length} events for region: ${regionKey}`);
        
      } catch (error) {
        console.error('Error loading regional events:', error);
        this.loadingState.pendingRequests.delete(regionKey);
      } finally {
        onLoadingChange(false);
      }
    }, this.THROTTLE_DELAY);
  }

  /**
   * Generate a unique key for a region based on bounds
   */
  private getRegionKey(bounds: MapBounds): string {
    // Round bounds to create consistent regions
    const roundTo = 10; // Round to nearest 10 degrees
    const north = Math.round(bounds.north / roundTo) * roundTo;
    const south = Math.round(bounds.south / roundTo) * roundTo;
    const east = Math.round(bounds.east / roundTo) * roundTo;
    const west = Math.round(bounds.west / roundTo) * roundTo;
    
    return `${north},${south},${east},${west}`;
  }

  /**
   * Reset the loading state (useful for clearing cache)
   */
  reset(): void {
    this.loadingState.loadedRegions.clear();
    this.loadingState.pendingRequests.clear();
    this.loadingState.isLoading = false;
    
    if (this.throttleTimeout) {
      clearTimeout(this.throttleTimeout);
      this.throttleTimeout = null;
    }
  }

  /**
   * Get current loading state
   */
  getLoadingState(): LoadingState {
    return { ...this.loadingState };
  }
}

// Export singleton instance
export const dynamicLoadingService = new DynamicLoadingService();
export type { MapBounds };
