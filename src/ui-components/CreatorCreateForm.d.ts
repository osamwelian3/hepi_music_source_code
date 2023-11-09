/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

import * as React from "react";
import { GridProps, TextFieldProps } from "@aws-amplify/ui-react";
import { EscapeHatchProps } from "@aws-amplify/ui-react/internal";
export declare type ValidationResponse = {
    hasError: boolean;
    errorMessage?: string;
};
export declare type ValidationFunction<T> = (value: T, validationResponse: ValidationResponse) => ValidationResponse | Promise<ValidationResponse>;
export declare type CreatorCreateFormInputValues = {
    key?: string;
    desc?: string;
    facebook?: string;
    instagram?: string;
    name?: string;
    thumbnail?: string;
    thumbnailKey?: string;
    twitter?: string;
    youtube?: string;
};
export declare type CreatorCreateFormValidationValues = {
    key?: ValidationFunction<string>;
    desc?: ValidationFunction<string>;
    facebook?: ValidationFunction<string>;
    instagram?: ValidationFunction<string>;
    name?: ValidationFunction<string>;
    thumbnail?: ValidationFunction<string>;
    thumbnailKey?: ValidationFunction<string>;
    twitter?: ValidationFunction<string>;
    youtube?: ValidationFunction<string>;
};
export declare type PrimitiveOverrideProps<T> = Partial<T> & React.DOMAttributes<HTMLDivElement>;
export declare type CreatorCreateFormOverridesProps = {
    CreatorCreateFormGrid?: PrimitiveOverrideProps<GridProps>;
    key?: PrimitiveOverrideProps<TextFieldProps>;
    desc?: PrimitiveOverrideProps<TextFieldProps>;
    facebook?: PrimitiveOverrideProps<TextFieldProps>;
    instagram?: PrimitiveOverrideProps<TextFieldProps>;
    name?: PrimitiveOverrideProps<TextFieldProps>;
    thumbnail?: PrimitiveOverrideProps<TextFieldProps>;
    thumbnailKey?: PrimitiveOverrideProps<TextFieldProps>;
    twitter?: PrimitiveOverrideProps<TextFieldProps>;
    youtube?: PrimitiveOverrideProps<TextFieldProps>;
} & EscapeHatchProps;
export declare type CreatorCreateFormProps = React.PropsWithChildren<{
    overrides?: CreatorCreateFormOverridesProps | undefined | null;
} & {
    clearOnSuccess?: boolean;
    onSubmit?: (fields: CreatorCreateFormInputValues) => CreatorCreateFormInputValues;
    onSuccess?: (fields: CreatorCreateFormInputValues) => void;
    onError?: (fields: CreatorCreateFormInputValues, errorMessage: string) => void;
    onChange?: (fields: CreatorCreateFormInputValues) => CreatorCreateFormInputValues;
    onValidate?: CreatorCreateFormValidationValues;
} & React.CSSProperties>;
export default function CreatorCreateForm(props: CreatorCreateFormProps): React.ReactElement;
