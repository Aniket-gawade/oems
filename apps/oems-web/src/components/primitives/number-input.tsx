import { Input, type InputProps } from "@/components/primitives/input";

export interface NumberInputProps extends Omit<InputProps, "type"> {}

export const NumberInput = (props: NumberInputProps) => <Input inputMode="decimal" type="number" {...props} />;
