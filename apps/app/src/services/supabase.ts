import AsyncStorage from "@react-native-async-storage/async-storage";
import { createSupabaseClient } from "@todo/supabase";

export const supabase = createSupabaseClient(AsyncStorage);