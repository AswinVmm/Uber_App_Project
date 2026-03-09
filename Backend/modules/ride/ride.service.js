exports.calculateFare = (distanceKm) => {
    const baseFare = 35;
    const pricePerKm = 12;
    return baseFare + distanceKm * pricePerKm;
};