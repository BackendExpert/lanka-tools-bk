import * as geoip from "geoip-lite";

export const getLocationFromIP = (ip: string) => {
    if (!ip) return null;

    // Fix IPv6 localhost issue
    if (ip === "::1") ip = "127.0.0.1";

    const geo = geoip.lookup(ip);

    if (!geo) return null;

    return {
        country: geo.country,
        city: geo.city,
        lat: geo.ll[0],
        lon: geo.ll[1],
    };
};