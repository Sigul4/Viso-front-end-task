export const removeMarkersByIndexes = (markersArray: google.maps.Marker[], indexesToRemove: number[]) => {
    if (!Array.isArray(indexesToRemove) || indexesToRemove.length === 0) {
        console.error('Invalid indexes');
        return markersArray.slice();
    }

    return markersArray.filter((_, index) => !indexesToRemove.includes(index));
};

export const findMarkerIndex = (markersArray: google.maps.Marker[], position: google.maps.LatLngLiteral) => {
    return markersArray.findIndex((marker) => {
        const markerPosition = marker.getPosition()?.toJSON();

        if (!markerPosition) return new Error('get position error');
        
        return (
            markerPosition.lat === position.lat &&
            markerPosition.lng === position.lng
        );
    });
};
