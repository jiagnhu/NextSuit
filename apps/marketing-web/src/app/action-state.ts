export type FormActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

export const initialActionState: FormActionState = {
  status: "idle",
  message: ""
};
