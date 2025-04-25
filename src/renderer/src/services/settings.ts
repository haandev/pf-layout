import axios from "axios";
import { supabase } from ".";

export const getProj4DefsByEpsg = async (epsg: number): Promise<string> => {
  const proj4def = await axios.get(`https://epsg.io/${epsg}.js`);
  return proj4def.data;
};

export const getStyles = async () => {};

export const getPoints = async () => {
  let { data: points, error } = await supabase.from("points").select("id");
  if (error) {
    throw error;
  }
  return points;
};
