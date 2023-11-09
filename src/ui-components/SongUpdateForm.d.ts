/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

import * as React from "react";
import { GridProps, TextFieldProps } from "@aws-amplify/ui-react";
import { EscapeHatchProps } from "@aws-amplify/ui-react/internal";
import { Song } from "../models";
export declare type ValidationResponse = {
    hasError: boolean;
    errorMessage?: string;
};
export declare type ValidationFunction<T> = (value: T, validationResponse: ValidationResponse) => ValidationResponse | Promise<ValidationResponse>;
export declare type SongUpdateFormInputValues = {
    key?: string;
    fileUrl?: string;
    fileKey?: string;
    listens?: string[];
    trendingListens?: string[];
    listOfUidDownVotes?: string[];
    listOfUidUpVotes?: string[];
    name?: string;
    partOf?: string;
    selectedCategory?: string;
    selectedCreator?: string;
    thumbnail?: string;
    thumbnailKey?: string;
};
export declare type SongUpdateFormValidationValues = {
    key?: ValidationFunction<string>;
    fileUrl?: ValidationFunction<string>;
    fileKey?: ValidationFunction<string>;
    listens?: ValidationFunction<string>;
    trendingListens?: ValidationFunction<string>;
    listOfUidDownVotes?: ValidationFunction<string>;
    listOfUidUpVotes?: ValidationFunction<string>;
    name?: ValidationFunction<string>;
    partOf?: ValidationFunction<string>;
    selectedCategory?: ValidationFunction<string>;
    selectedCreator?: ValidationFunction<string>;
    thumbnail?: ValidationFunction<string>;
    thumbnailKey?: ValidationFunction<string>;
};
export declare type PrimitiveOverrideProps<T> = Partial<T> & React.DOMAttributes<HTMLDivElement>;
export declare type SongUpdateFormOverridesProps = {
    SongUpdateFormGrid?: PrimitiveOverrideProps<GridProps>;
    key?: PrimitiveOverrideProps<TextFieldProps>;
    fileUrl?: PrimitiveOverrideProps<TextFieldProps>;
    fileKey?: PrimitiveOverrideProps<TextFieldProps>;
    listens?: PrimitiveOverrideProps<TextFieldProps>;
    trendingListens?: PrimitiveOverrideProps<TextFieldProps>;
    listOfUidDownVotes?: PrimitiveOverrideProps<TextFieldProps>;
    listOfUidUpVotes?: PrimitiveOverrideProps<TextFieldProps>;
    name?: PrimitiveOverrideProps<TextFieldProps>;
    partOf?: PrimitiveOverrideProps<TextFieldProps>;
    selectedCategory?: PrimitiveOverrideProps<TextFieldProps>;
    selectedCreator?: PrimitiveOverrideProps<TextFieldProps>;
    thumbnail?: PrimitiveOverrideProps<TextFieldProps>;
    thumbnailKey?: PrimitiveOverrideProps<TextFieldProps>;
} & EscapeHatchProps;
export declare type SongUpdateFormProps = React.PropsWithChildren<{
    overrides?: SongUpdateFormOverridesProps | undefined | null;
} & {
    key?: string;
    song?: Song;
    onSubmit?: (fields: SongUpdateFormInputValues) => SongUpdateFormInputValues;
    onSuccess?: (fields: SongUpdateFormInputValues) => void;
    onError?: (fields: SongUpdateFormInputValues, errorMessage: string) => void;
    onChange?: (fields: SongUpdateFormInputValues) => SongUpdateFormInputValues;
    onValidate?: SongUpdateFormValidationValues;
} & React.CSSProperties>;
export default function SongUpdateForm(props: SongUpdateFormProps): React.ReactElement;
