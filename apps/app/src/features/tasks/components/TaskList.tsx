import { Platform } from "react-native";

import { TaskList as NativeTaskList } from "./TaskList.native";
import { TaskList as WebTaskList } from "./TaskList.web";

export function TaskList() {
  return Platform.OS === "web"
    ? <WebTaskList />
    : <NativeTaskList />;
}