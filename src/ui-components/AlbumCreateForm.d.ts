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
export declare type AlbumCreateFormInputValues = {
    key?: string;
    name?: string;
    thumbnail?: string;
    thumbnailKey?: string;
};
export declare type AlbumCreateFormValidationValues = {
    key?: ValidationFunction<string>;
    name?: ValidationFunction<string>;
    thumbnail?: ValidationFunction<string>;
    thumbnailKey?: ValidationFunction<string>;
};
export declare type PrimitiveOverrideProps<T> = Partial<T> & React.DOMAttributes<HTMLDivElement>;
export declare type AlbumCreateFormOverridesProps = {
    AlbumCreateFormGrid?: PrimitiveOverrideProps<GridProps>;
    key?: PrimitiveOverrideProps<TextFieldProps>;
    name?: PrimitiveOverrideProps<TextFieldProps>;
    thumbnail?: PrimitiveOverrideProps<TextFieldProps>;
    thumbnailKey?: PrimitiveOverrideProps<TextFieldProps>;
} & EscapeHatchProps;
export declare type AlbumCreateFormProps = React.PropsWithChildren<{
    overrides?: AlbumCreateFormOverridesProps | undefined | null;
} & {
    clearOnSuccess?: boolean;
    onSubmit?: (fields: AlbumCreateFormInputValues) => AlbumCreateFormInputValues;
    onSuccess?: (fields: AlbumCreateFormInputValues) => void;
    onError?: (fields: AlbumCreateFormInputValues, errorMessage: string) => void;
    onChange?: (fields: AlbumCreateFormInputValues) => AlbumCreateFormInputValues;
    onValidate?: AlbumCreateFormValidationValues;
} & React.CSSProperties>;
export default function AlbumCreateForm(props: AlbumCreateFormProps): React.ReactElement;
