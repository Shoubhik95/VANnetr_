// VanNetr Spatial Anomaly & Geometric Intersection Engine
// Complete National MoTA FRA Baseline for all 36 Indian States and Union Territories

export const PROTECTED_FOREST_ZONES = [
  {
    id: 'SIMILIPAL_TIGER_BUFFER',
    name: 'Similipal Tiger Reserve Buffer Corridor',
    state: 'Odisha',
    district: 'Mayurbhanj',
    designation: 'Critical Tiger Habitat (CTH) Buffer',
    coordinates: [
      [21.7500, 86.1000],
      [21.9500, 86.0500],
      [21.9800, 86.3500],
      [21.7800, 86.4000],
      [21.7500, 86.1000]
    ]
  },
  {
    id: 'KANHA_BUFFER_ZONE',
    name: 'Kanha National Park Buffer & Corridor',
    state: 'Madhya Pradesh',
    district: 'Mandla',
    designation: 'National Park Wildlife Corridor',
    coordinates: [
      [22.3500, 80.4500],
      [22.5500, 80.4800],
      [22.5200, 80.7000],
      [22.3200, 80.6500],
      [22.3500, 80.4500]
    ]
  },
  {
    id: 'INDRAVATI_HABITAT',
    name: 'Indravati Tiger Reserve Buffer',
    state: 'Chhattisgarh',
    district: 'Bastar',
    designation: 'Wild Buffalo & Tiger Reserve',
    coordinates: [
      [18.8500, 80.8500],
      [19.2000, 80.8000],
      [19.2500, 81.2500],
      [18.9000, 81.3000],
      [18.8500, 80.8500]
    ]
  }
];

// Point in Polygon algorithm (Ray-casting)
export function isPointInPolygon(point, polygon) {
  const [lat, lng] = point;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [latI, lngI] = polygon[i];
    const [latJ, lngJ] = polygon[j];

    const intersect = ((lngI > lng) !== (lngJ > lng)) &&
      (lat < (latJ - latI) * (lng - lngI) / (lngJ - lngI) + latI);

    if (intersect) inside = !inside;
  }
  return inside;
}

// Calculate physical polygon intersection with protected sanctuary buffers
export function checkSanctuaryOverlap(claimPolygon) {
  if (!claimPolygon || claimPolygon.length < 3) return null;

  for (const zone of PROTECTED_FOREST_ZONES) {
    let pointsInside = 0;
    for (const pt of claimPolygon) {
      if (isPointInPolygon(pt, zone.coordinates)) {
        pointsInside++;
      }
    }

    if (pointsInside > 0) {
      const overlapPercentage = Math.round((pointsInside / claimPolygon.length) * 100);
      return {
        zoneId: zone.id,
        zoneName: zone.name,
        designation: zone.designation,
        pointsInside,
        overlapPercentage
      };
    }
  }

  return null;
}

// Complete National MoTA FRA Data Baseline for ALL 36 States & UTs
export const ALL_INDIA_STATE_DATA = {
  'Odisha': {
    totalClaims: 661456, approved: 462140, pending: 154200, rejected: 45116,
    approvalRate: 70, grantedLandHa: 272200, flaggedAnomalies: 1240, slaBreaches: 420,
    activeHotspots: ['Mayurbhanj', 'Kandhamal', 'Sundargarh', 'Koraput']
  },
  'Chhattisgarh': {
    totalClaims: 928340, approved: 482590, pending: 312000, rejected: 133750,
    approvalRate: 52, grantedLandHa: 370000, flaggedAnomalies: 2180, slaBreaches: 890,
    activeHotspots: ['Bastar', 'Kanker', 'Dantewada', 'Sukma']
  },
  'Madhya Pradesh': {
    totalClaims: 627800, approved: 294100, pending: 215000, rejected: 118700,
    approvalRate: 47, grantedLandHa: 195000, flaggedAnomalies: 1840, slaBreaches: 610,
    activeHotspots: ['Mandla', 'Dindori', 'Balaghat', 'Barwani']
  },
  'Maharashtra': {
    totalClaims: 392100, approved: 241500, pending: 89400, rejected: 61200,
    approvalRate: 62, grantedLandHa: 505800, flaggedAnomalies: 740, slaBreaches: 210,
    activeHotspots: ['Gadchiroli', 'Nandurbar', 'Amravati']
  },
  'Jharkhand': {
    totalClaims: 112400, approved: 61200, pending: 36800, rejected: 14400,
    approvalRate: 54, grantedLandHa: 87000, flaggedAnomalies: 580, slaBreaches: 190,
    activeHotspots: ['West Singhbhum', 'Ranchi', 'Gumla']
  },
  'Gujarat': {
    totalClaims: 190400, approved: 98200, pending: 62100, rejected: 30100,
    approvalRate: 52, grantedLandHa: 112000, flaggedAnomalies: 620, slaBreaches: 180,
    activeHotspots: ['Dangs', 'Narmada', 'Dahod']
  },
  'Rajasthan': {
    totalClaims: 84200, approved: 41600, pending: 28400, rejected: 14200,
    approvalRate: 49, grantedLandHa: 48000, flaggedAnomalies: 310, slaBreaches: 95,
    activeHotspots: ['Udaipur', 'Banswara', 'Dungarpur']
  },
  'Telangana': {
    totalClaims: 224000, approved: 118500, pending: 74200, rejected: 31300,
    approvalRate: 53, grantedLandHa: 135000, flaggedAnomalies: 890, slaBreaches: 310,
    activeHotspots: ['Bhadradri Kothagudem', 'Asifabad']
  },
  'Andhra Pradesh': {
    totalClaims: 182000, approved: 96400, pending: 58200, rejected: 27400,
    approvalRate: 53, grantedLandHa: 118000, flaggedAnomalies: 740, slaBreaches: 240,
    activeHotspots: ['Alluri Sitharama Raju', 'Parvathipuram Manyam']
  },
  'Karnataka': {
    totalClaims: 294000, approved: 48500, pending: 162000, rejected: 83500,
    approvalRate: 16, grantedLandHa: 34000, flaggedAnomalies: 1920, slaBreaches: 940,
    activeHotspots: ['Uttara Kannada', 'Kodagu', 'Chikkamagaluru']
  },
  'Kerala': {
    totalClaims: 43200, approved: 31400, pending: 8200, rejected: 3600,
    approvalRate: 73, grantedLandHa: 22400, flaggedAnomalies: 120, slaBreaches: 45,
    activeHotspots: ['Wayanad', 'Idukki', 'Palakkad']
  },
  'Tamil Nadu': {
    totalClaims: 34800, approved: 12400, pending: 15600, rejected: 6800,
    approvalRate: 36, grantedLandHa: 9800, flaggedAnomalies: 410, slaBreaches: 180,
    activeHotspots: ['Nilgiris', 'Dharmapuri']
  },
  'Tripura': {
    totalClaims: 200500, approved: 132400, pending: 48200, rejected: 19900,
    approvalRate: 66, grantedLandHa: 188000, flaggedAnomalies: 320, slaBreaches: 110,
    activeHotspots: ['Dhalai', 'North Tripura']
  },
  'Assam': {
    totalClaims: 154000, approved: 64200, pending: 62400, rejected: 27400,
    approvalRate: 42, grantedLandHa: 54000, flaggedAnomalies: 840, slaBreaches: 390,
    activeHotspots: ['Karbi Anglong', 'Dima Hasao']
  },
  'West Bengal': {
    totalClaims: 142000, approved: 48200, pending: 64100, rejected: 29700,
    approvalRate: 34, grantedLandHa: 28400, flaggedAnomalies: 920, slaBreaches: 440,
    activeHotspots: ['Jalpaiguri', 'Alipurduar', 'Jhargram']
  },
  'Himachal Pradesh': {
    totalClaims: 18400, approved: 4200, pending: 10800, rejected: 3400,
    approvalRate: 23, grantedLandHa: 3200, flaggedAnomalies: 310, slaBreaches: 140,
    activeHotspots: ['Kinnaur', 'Lahaul and Spiti']
  },
  'Uttarakhand': {
    totalClaims: 12800, approved: 2400, pending: 7600, rejected: 2800,
    approvalRate: 19, grantedLandHa: 1800, flaggedAnomalies: 280, slaBreaches: 110,
    activeHotspots: ['Chamoli', 'Uttarkashi']
  },
  'Bihar': {
    totalClaims: 9800, approved: 2800, pending: 5200, rejected: 1800,
    approvalRate: 29, grantedLandHa: 2100, flaggedAnomalies: 140, slaBreaches: 60,
    activeHotspots: ['West Champaran', 'Kaimur']
  },
  'Uttar Pradesh': {
    totalClaims: 94200, approved: 21400, pending: 51200, rejected: 21600,
    approvalRate: 23, grantedLandHa: 18400, flaggedAnomalies: 680, slaBreaches: 310,
    activeHotspots: ['Sonbhadra', 'Chandauli', 'Lakhimpur Kheri']
  },
  'Goa': {
    totalClaims: 11200, approved: 1800, pending: 7400, rejected: 2000,
    approvalRate: 16, grantedLandHa: 1200, flaggedAnomalies: 160, slaBreaches: 70,
    activeHotspots: ['South Goa']
  },
  // North-Eastern & Himalayan States
  'Arunachal Pradesh': {
    totalClaims: 6400, approved: 4800, pending: 1200, rejected: 400,
    approvalRate: 75, grantedLandHa: 9400, flaggedAnomalies: 40, slaBreaches: 15,
    activeHotspots: ['Changlang']
  },
  'Manipur': {
    totalClaims: 8200, approved: 4900, pending: 2400, rejected: 900,
    approvalRate: 60, grantedLandHa: 6800, flaggedAnomalies: 70, slaBreaches: 25,
    activeHotspots: ['Churachandpur']
  },
  'Meghalaya': {
    totalClaims: 5400, approved: 3800, pending: 1200, rejected: 400,
    approvalRate: 70, grantedLandHa: 4900, flaggedAnomalies: 30, slaBreaches: 10,
    activeHotspots: ['West Garo Hills']
  },
  'Mizoram': {
    totalClaims: 7800, approved: 5600, pending: 1600, rejected: 600,
    approvalRate: 72, grantedLandHa: 7100, flaggedAnomalies: 40, slaBreaches: 12,
    activeHotspots: ['Lunglei']
  },
  'Nagaland': {
    totalClaims: 4900, approved: 3700, pending: 900, rejected: 300,
    approvalRate: 76, grantedLandHa: 5200, flaggedAnomalies: 25, slaBreaches: 8,
    activeHotspots: ['Mon']
  },
  'Sikkim': {
    totalClaims: 3200, approved: 2100, pending: 800, rejected: 300,
    approvalRate: 66, grantedLandHa: 2400, flaggedAnomalies: 15, slaBreaches: 5,
    activeHotspots: ['North Sikkim']
  },
  'Jammu & Kashmir': {
    totalClaims: 28400, approved: 6800, pending: 16800, rejected: 4800,
    approvalRate: 24, grantedLandHa: 5400, flaggedAnomalies: 380, slaBreaches: 160,
    activeHotspots: ['Rajouri', 'Poonch', 'Anantnag']
  },
  'Ladakh': {
    totalClaims: 1800, approved: 600, pending: 900, rejected: 300,
    approvalRate: 33, grantedLandHa: 800, flaggedAnomalies: 20, slaBreaches: 5,
    activeHotspots: ['Kargil']
  },
  'Punjab': {
    totalClaims: 2100, approved: 400, pending: 1200, rejected: 500,
    approvalRate: 19, grantedLandHa: 350, flaggedAnomalies: 40, slaBreaches: 18,
    activeHotspots: ['Hoshiarpur']
  },
  'Haryana': {
    totalClaims: 1400, approved: 200, pending: 800, rejected: 400,
    approvalRate: 14, grantedLandHa: 180, flaggedAnomalies: 30, slaBreaches: 12,
    activeHotspots: ['Panchkula', 'Yamunanagar']
  },
  'Andaman & Nicobar': {
    totalClaims: 2400, approved: 1600, pending: 600, rejected: 200,
    approvalRate: 67, grantedLandHa: 2800, flaggedAnomalies: 15, slaBreaches: 5,
    activeHotspots: ['Nicobar']
  },
  // UTs with zero/negligible forest rights claims
  'Delhi': {
    totalClaims: 0, approved: 0, pending: 0, rejected: 0,
    approvalRate: 0, grantedLandHa: 0, flaggedAnomalies: 0, slaBreaches: 0,
    activeHotspots: []
  },
  'Chandigarh': {
    totalClaims: 0, approved: 0, pending: 0, rejected: 0,
    approvalRate: 0, grantedLandHa: 0, flaggedAnomalies: 0, slaBreaches: 0,
    activeHotspots: []
  },
  'Puducherry': {
    totalClaims: 0, approved: 0, pending: 0, rejected: 0,
    approvalRate: 0, grantedLandHa: 0, flaggedAnomalies: 0, slaBreaches: 0,
    activeHotspots: []
  },
  'Dadra and Nagar Haveli and Daman and Diu': {
    totalClaims: 4200, approved: 2600, pending: 1200, rejected: 400,
    approvalRate: 62, grantedLandHa: 3100, flaggedAnomalies: 25, slaBreaches: 8,
    activeHotspots: ['Dadra & Nagar Haveli']
  },
  'Lakshadweep': {
    totalClaims: 0, approved: 0, pending: 0, rejected: 0,
    approvalRate: 0, grantedLandHa: 0, flaggedAnomalies: 0, slaBreaches: 0,
    activeHotspots: []
  }
};

export const MOTA_STATE_BENCHMARKS = ALL_INDIA_STATE_DATA;

