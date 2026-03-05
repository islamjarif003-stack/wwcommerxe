// ============================================================
// WW Commerce OS – Bangladesh Delivery Zone Logic
// ============================================================

export const BANGLADESH_DISTRICTS = [
    // Dhaka Division
    "Dhaka", "Gazipur", "Narayanganj", "Narsingdi", "Manikganj", "Munshiganj",
    "Rajbari", "Faridpur", "Gopalganj", "Madaripur", "Shariatpur",
    // Chittagong Division
    "Chattogram", "Cox's Bazar", "Rangamati", "Bandarban", "Khagrachhari",
    "Feni", "Noakhali", "Lakshmipur", "Comilla", "Chandpur", "Brahmanbaria",
    // Rajshahi Division
    "Rajshahi", "Chapai Nawabganj", "Naogaon", "Natore", "Bogura", "Joypurhat",
    "Pabna", "Sirajganj",
    // Khulna Division
    "Khulna", "Bagerhat", "Satkhira", "Jessore", "Narail", "Magura",
    "Jhenaidah", "Kushtia", "Chuadanga", "Meherpur",
    // Barishal Division
    "Barishal", "Patuakhali", "Pirojpur", "Jhalokati", "Barguna", "Bhola",
    // Sylhet Division
    "Sylhet", "Moulvibazar", "Habiganj", "Sunamganj",
    // Rangpur Division
    "Rangpur", "Dinajpur", "Thakurgaon", "Panchagarh", "Nilphamari",
    "Lalmonirhat", "Kurigram", "Gaibandha",
    // Mymensingh Division
    "Mymensingh", "Netrokona", "Kishoreganj", "Jamalpur",
    // Chattogram special
    "Cumilla",
];

export const DHAKA_CITY_AREAS = [
    "Mirpur", "Mohammadpur", "Dhanmondi", "Gulshan", "Banani", "Uttara",
    "Motijheel", "Puran Dhaka", "Wari", "Lalbagh", "Kamrangirchar",
    "Hazaribagh", "Savar", "Keraniganj", "Dohar", "Nawabganj",
    "Tejgaon", "Rampura", "Badda", "Khilkhet", "Khilgaon", "Demra",
    "Jatrabari", "Shyampur", "Kotwali", "Sutrapur", "Pallabi",
    "Rupnagar", "Turag", "Kafrul", "Cantonment", "Dakshinkhan",
    "Uttarkhan", "Adabor", "Mohakhali", "Shantinagar", "Ramna",
];

export interface DeliveryCalculation {
    zoneId: string;
    zoneName: string;
    charge: number;
    estimatedDays: string;
    isFreeDelivery: boolean;
    freeDeliveryThreshold?: number;
    availableCouriers: string[];
}

export const calculateDelivery = (
    district: string,
    orderTotal: number,
    zones: Array<{
        id: string;
        name: string;
        type: string;
        districts: string[];
        baseCharge: number;
        freeDeliveryThreshold?: number;
        estimatedDays: string;
        couriers: string[];
        isActive: boolean;
    }>
): DeliveryCalculation | null => {
    const activeZones = zones.filter((z) => z.isActive);

    // Match zone
    let matchedZone = activeZones.find((z) =>
        z.type === "dhaka_city" && district === "Dhaka"
    );

    if (!matchedZone) {
        matchedZone = activeZones.find((z) =>
            z.type === "dhaka_district" &&
            ["Gazipur", "Narayanganj", "Narsingdi", "Manikganj"].includes(district)
        );
    }

    if (!matchedZone) {
        matchedZone = activeZones.find((z) =>
            z.districts.includes(district)
        );
    }

    if (!matchedZone) {
        matchedZone = activeZones.find((z) => z.type === "outside_dhaka");
    }

    if (!matchedZone) return null;

    const isFreeDelivery = matchedZone.freeDeliveryThreshold
        ? orderTotal >= matchedZone.freeDeliveryThreshold
        : false;

    return {
        zoneId: matchedZone.id,
        zoneName: matchedZone.name,
        charge: isFreeDelivery ? 0 : matchedZone.baseCharge,
        estimatedDays: matchedZone.estimatedDays,
        isFreeDelivery,
        freeDeliveryThreshold: matchedZone.freeDeliveryThreshold,
        availableCouriers: matchedZone.couriers,
    };
};

export const generateOrderNumber = (): string => {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `WW${year}${month}${day}-${random}`;
};
