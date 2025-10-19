import { createPathComponent } from '@react-leaflet/core';
import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

interface MarkerClusterGroupProps extends L.MarkerClusterGroupOptions {
  children: React.ReactNode;
}

const MarkerClusterGroup = createPathComponent<L.MarkerClusterGroup, MarkerClusterGroupProps>(
  ({ children: _c, ...props }, ctx) => {
    const clusterProps: L.MarkerClusterGroupOptions = {};
    const clusterEvents: L.LeafletEventHandlerFnMap = {};

    // Splitting props and events to different objects
    Object.entries(props).forEach(([propName, prop]) => {
      if (propName.startsWith('on')) {
        clusterEvents[propName] = prop as L.LeafletEventHandlerFn;
      } else {
        clusterProps[propName as keyof L.MarkerClusterGroupOptions] = prop as any;
      }
    });

    const clusterGroup = new (L as any).MarkerClusterGroup(clusterProps);

    Object.entries(clusterEvents).forEach(([eventAsProp, callback]) => {
      const event = `${eventAsProp[2].toLowerCase()}${eventAsProp.slice(3)}`;
      clusterGroup.on(event, callback);
    });

    return {
      instance: clusterGroup,
      context: { ...ctx, layerContainer: clusterGroup },
    };
  }
);

export default MarkerClusterGroup;

