/*
 * Photos for catalog models, keyed by vehicle slug. Only openly licensed
 * images (e.g. Wikimedia Commons) go here, each with its credit and licence,
 * which the model page displays. Models without an entry show placeholder art.
 */

export type VehiclePhoto = {
  src: string;
  credit: string;
  license: string;
  sourceUrl: string;
};

export const vehiclePhotos: Record<string, VehiclePhoto> = {};
