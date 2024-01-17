import React, { useEffect, useState } from 'react';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';
import FirebaseService from '../services/FirebaseService';
import { removeMarkersByIndexes, findMarkerIndex } from '../utils';
import { POSITION_ERROR } from '../shared/PositionErrorConstant';
import { PositionDataInterface } from '../shared/PositionInterface';
import { DEFAULT_CENTER_MARKER } from '../shared/DefaultCenterConstant';

const libraries = ['places'] as any;
const mapContainerStyle = {
    width: '80vw',
    height: '80vh',
};
const center = DEFAULT_CENTER_MARKER;

const Map: React.FC = () => {
    const firebaseService = new FirebaseService();

    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: 'AIzaSyC44hOXavfrNl5DmUsFLrnGJKVBn_PrO1Q',
        libraries,
    });

    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [markersArray, setMarkers] = useState<google.maps.Marker[]>([]);

    useEffect(() => {
        if (map) prefillMarkers();

        return () => {};
    }, [map]);

    const prefillMarkers: () => void = () => {
        firebaseService.fetchMarkersData('quests').then((data) => {
            data.forEach((prefilledMarker) => {
                placeMarker(prefilledMarker.data.Location, true);
            });
        });
    };

    const onLoad: (map: google.maps.Map) => void = (map: google.maps.Map) => {
        const bounds = new window.google.maps.LatLngBounds(center);
        map.fitBounds(bounds);

        setMap(map);
    };

    const onUnmount: () => void = () => {
        setMap(null);
    };

    const placeMarker: (position?: PositionDataInterface, isPrefilled?: boolean) => Error | undefined = (
        position?: PositionDataInterface,
        isPrefilled?: boolean
    ) => {
        if (!position) return new Error(POSITION_ERROR);

        const marker = new window.google.maps.Marker({
            position,
            draggable: true,
            label: (markersArray.length + 1).toString(),
            map,
        });
        markersArray.push(marker);
        map?.panTo(position);

        addMarkerCleaner(marker);
        
        if (!isPrefilled) uploadMarkerToDb(position);
    };

    const uploadMarkerToDb: (position: PositionDataInterface) => void
     = (position: PositionDataInterface) => {
        const markerData = {
            Location: { lat: position.lat, lng: position.lng },
            Timestamp: new Date().toLocaleTimeString(),
            Next: `quests/Quest ${markersArray.length + 1}`,
        };

        firebaseService.sendData('quests', `Quest ${markersArray.length}`, markerData);
    }

    const addMarkerCleaner: (marker: google.maps.Marker) => void
     = (marker: google.maps.Marker) => {
        marker.addListener( 'rightclick',
            async (event: { latLng: { toJSON: () => any } }) => {
                const markerPosition = event.latLng.toJSON();
                const markerIndex = findMarkerIndex(
                    markersArray,
                    markerPosition
                );

                const markerData = await firebaseService.fetchData<any>('quests',`Quest ${markerIndex + 1}`);

                if (markerData) {
                    await firebaseService.deleteData('quests',`Quest ${markerIndex + 1}`);

                    setMarkers(removeMarkersByIndexes(markersArray, [markerIndex]));
                    markersArray[markerIndex].setMap(null);
                }
            }
        );
    }

    const clearOverlays: () => void = () => {
        markersArray.forEach((marker) => marker.setMap(null));
        setMarkers([]);
    };

    if (loadError) {
        return <div>Error loading maps</div>;
    }

    if (!isLoaded) {
        return <div>Loading maps</div>;
    }

    return (
        <div>
            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                zoom={10}
                center={center}
                onLoad={onLoad}
                onUnmount={onUnmount}
                onClick={(event) => placeMarker(event?.latLng?.toJSON())}
            >
                {map && <Marker position={center} />}
            </GoogleMap>

            <button onClick={clearOverlays}>Clear</button>
        </div>
    );
};

export default Map;
