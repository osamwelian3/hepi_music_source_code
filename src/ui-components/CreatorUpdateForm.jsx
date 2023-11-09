/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

/* eslint-disable */
import * as React from "react";
import { Button, Flex, Grid, TextField } from "@aws-amplify/ui-react";
import { getOverrideProps } from "@aws-amplify/ui-react/internal";
import { Creator } from "../models";
import { fetchByPath, validateField } from "./utils";
import { DataStore } from "aws-amplify";
export default function CreatorUpdateForm(props) {
  const {
    key: keyProp,
    creator: creatorModelProp,
    onSuccess,
    onError,
    onSubmit,
    onValidate,
    onChange,
    overrides,
    ...rest
  } = props;
  const initialValues = {
    key: "",
    desc: "",
    facebook: "",
    instagram: "",
    name: "",
    thumbnail: "",
    thumbnailKey: "",
    twitter: "",
    youtube: "",
  };
  const [key, setKey] = React.useState(initialValues.key);
  const [desc, setDesc] = React.useState(initialValues.desc);
  const [facebook, setFacebook] = React.useState(initialValues.facebook);
  const [instagram, setInstagram] = React.useState(initialValues.instagram);
  const [name, setName] = React.useState(initialValues.name);
  const [thumbnail, setThumbnail] = React.useState(initialValues.thumbnail);
  const [thumbnailKey, setThumbnailKey] = React.useState(
    initialValues.thumbnailKey
  );
  const [twitter, setTwitter] = React.useState(initialValues.twitter);
  const [youtube, setYoutube] = React.useState(initialValues.youtube);
  const [errors, setErrors] = React.useState({});
  const resetStateValues = () => {
    const cleanValues = creatorRecord
      ? { ...initialValues, ...creatorRecord }
      : initialValues;
    setKey(cleanValues.key);
    setDesc(cleanValues.desc);
    setFacebook(cleanValues.facebook);
    setInstagram(cleanValues.instagram);
    setName(cleanValues.name);
    setThumbnail(cleanValues.thumbnail);
    setThumbnailKey(cleanValues.thumbnailKey);
    setTwitter(cleanValues.twitter);
    setYoutube(cleanValues.youtube);
    setErrors({});
  };
  const [creatorRecord, setCreatorRecord] = React.useState(creatorModelProp);
  React.useEffect(() => {
    const queryData = async () => {
      const record = keyProp
        ? await DataStore.query(Creator, keyProp)
        : creatorModelProp;
      setCreatorRecord(record);
    };
    queryData();
  }, [keyProp, creatorModelProp]);
  React.useEffect(resetStateValues, [creatorRecord]);
  const validations = {
    key: [{ type: "Required" }],
    desc: [],
    facebook: [],
    instagram: [],
    name: [{ type: "Required" }],
    thumbnail: [],
    thumbnailKey: [],
    twitter: [],
    youtube: [],
  };
  const runValidationTasks = async (
    fieldName,
    currentValue,
    getDisplayValue
  ) => {
    const value =
      currentValue && getDisplayValue
        ? getDisplayValue(currentValue)
        : currentValue;
    let validationResponse = validateField(value, validations[fieldName]);
    const customValidator = fetchByPath(onValidate, fieldName);
    if (customValidator) {
      validationResponse = await customValidator(value, validationResponse);
    }
    setErrors((errors) => ({ ...errors, [fieldName]: validationResponse }));
    return validationResponse;
  };
  return (
    <Grid
      as="form"
      rowGap="15px"
      columnGap="15px"
      padding="20px"
      onSubmit={async (event) => {
        event.preventDefault();
        let modelFields = {
          key,
          desc,
          facebook,
          instagram,
          name,
          thumbnail,
          thumbnailKey,
          twitter,
          youtube,
        };
        const validationResponses = await Promise.all(
          Object.keys(validations).reduce((promises, fieldName) => {
            if (Array.isArray(modelFields[fieldName])) {
              promises.push(
                ...modelFields[fieldName].map((item) =>
                  runValidationTasks(fieldName, item)
                )
              );
              return promises;
            }
            promises.push(
              runValidationTasks(fieldName, modelFields[fieldName])
            );
            return promises;
          }, [])
        );
        if (validationResponses.some((r) => r.hasError)) {
          return;
        }
        if (onSubmit) {
          modelFields = onSubmit(modelFields);
        }
        try {
          Object.entries(modelFields).forEach(([key, value]) => {
            if (typeof value === "string" && value.trim() === "") {
              modelFields[key] = undefined;
            }
          });
          await DataStore.save(
            Creator.copyOf(creatorRecord, (updated) => {
              Object.assign(updated, modelFields);
            })
          );
          if (onSuccess) {
            onSuccess(modelFields);
          }
        } catch (err) {
          if (onError) {
            onError(modelFields, err.message);
          }
        }
      }}
      {...getOverrideProps(overrides, "CreatorUpdateForm")}
      {...rest}
    >
      <TextField
        label="Key"
        isRequired={true}
        isReadOnly={true}
        value={key}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              key: value,
              desc,
              facebook,
              instagram,
              name,
              thumbnail,
              thumbnailKey,
              twitter,
              youtube,
            };
            const result = onChange(modelFields);
            value = result?.key ?? value;
          }
          if (errors.key?.hasError) {
            runValidationTasks("key", value);
          }
          setKey(value);
        }}
        onBlur={() => runValidationTasks("key", key)}
        errorMessage={errors.key?.errorMessage}
        hasError={errors.key?.hasError}
        {...getOverrideProps(overrides, "key")}
      ></TextField>
      <TextField
        label="Desc"
        isRequired={false}
        isReadOnly={false}
        value={desc}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              key,
              desc: value,
              facebook,
              instagram,
              name,
              thumbnail,
              thumbnailKey,
              twitter,
              youtube,
            };
            const result = onChange(modelFields);
            value = result?.desc ?? value;
          }
          if (errors.desc?.hasError) {
            runValidationTasks("desc", value);
          }
          setDesc(value);
        }}
        onBlur={() => runValidationTasks("desc", desc)}
        errorMessage={errors.desc?.errorMessage}
        hasError={errors.desc?.hasError}
        {...getOverrideProps(overrides, "desc")}
      ></TextField>
      <TextField
        label="Facebook"
        isRequired={false}
        isReadOnly={false}
        value={facebook}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              key,
              desc,
              facebook: value,
              instagram,
              name,
              thumbnail,
              thumbnailKey,
              twitter,
              youtube,
            };
            const result = onChange(modelFields);
            value = result?.facebook ?? value;
          }
          if (errors.facebook?.hasError) {
            runValidationTasks("facebook", value);
          }
          setFacebook(value);
        }}
        onBlur={() => runValidationTasks("facebook", facebook)}
        errorMessage={errors.facebook?.errorMessage}
        hasError={errors.facebook?.hasError}
        {...getOverrideProps(overrides, "facebook")}
      ></TextField>
      <TextField
        label="Instagram"
        isRequired={false}
        isReadOnly={false}
        value={instagram}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              key,
              desc,
              facebook,
              instagram: value,
              name,
              thumbnail,
              thumbnailKey,
              twitter,
              youtube,
            };
            const result = onChange(modelFields);
            value = result?.instagram ?? value;
          }
          if (errors.instagram?.hasError) {
            runValidationTasks("instagram", value);
          }
          setInstagram(value);
        }}
        onBlur={() => runValidationTasks("instagram", instagram)}
        errorMessage={errors.instagram?.errorMessage}
        hasError={errors.instagram?.hasError}
        {...getOverrideProps(overrides, "instagram")}
      ></TextField>
      <TextField
        label="Name"
        isRequired={true}
        isReadOnly={false}
        value={name}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              key,
              desc,
              facebook,
              instagram,
              name: value,
              thumbnail,
              thumbnailKey,
              twitter,
              youtube,
            };
            const result = onChange(modelFields);
            value = result?.name ?? value;
          }
          if (errors.name?.hasError) {
            runValidationTasks("name", value);
          }
          setName(value);
        }}
        onBlur={() => runValidationTasks("name", name)}
        errorMessage={errors.name?.errorMessage}
        hasError={errors.name?.hasError}
        {...getOverrideProps(overrides, "name")}
      ></TextField>
      <TextField
        label="Thumbnail"
        isRequired={false}
        isReadOnly={false}
        value={thumbnail}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              key,
              desc,
              facebook,
              instagram,
              name,
              thumbnail: value,
              thumbnailKey,
              twitter,
              youtube,
            };
            const result = onChange(modelFields);
            value = result?.thumbnail ?? value;
          }
          if (errors.thumbnail?.hasError) {
            runValidationTasks("thumbnail", value);
          }
          setThumbnail(value);
        }}
        onBlur={() => runValidationTasks("thumbnail", thumbnail)}
        errorMessage={errors.thumbnail?.errorMessage}
        hasError={errors.thumbnail?.hasError}
        {...getOverrideProps(overrides, "thumbnail")}
      ></TextField>
      <TextField
        label="Thumbnail key"
        isRequired={false}
        isReadOnly={false}
        value={thumbnailKey}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              key,
              desc,
              facebook,
              instagram,
              name,
              thumbnail,
              thumbnailKey: value,
              twitter,
              youtube,
            };
            const result = onChange(modelFields);
            value = result?.thumbnailKey ?? value;
          }
          if (errors.thumbnailKey?.hasError) {
            runValidationTasks("thumbnailKey", value);
          }
          setThumbnailKey(value);
        }}
        onBlur={() => runValidationTasks("thumbnailKey", thumbnailKey)}
        errorMessage={errors.thumbnailKey?.errorMessage}
        hasError={errors.thumbnailKey?.hasError}
        {...getOverrideProps(overrides, "thumbnailKey")}
      ></TextField>
      <TextField
        label="Twitter"
        isRequired={false}
        isReadOnly={false}
        value={twitter}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              key,
              desc,
              facebook,
              instagram,
              name,
              thumbnail,
              thumbnailKey,
              twitter: value,
              youtube,
            };
            const result = onChange(modelFields);
            value = result?.twitter ?? value;
          }
          if (errors.twitter?.hasError) {
            runValidationTasks("twitter", value);
          }
          setTwitter(value);
        }}
        onBlur={() => runValidationTasks("twitter", twitter)}
        errorMessage={errors.twitter?.errorMessage}
        hasError={errors.twitter?.hasError}
        {...getOverrideProps(overrides, "twitter")}
      ></TextField>
      <TextField
        label="Youtube"
        isRequired={false}
        isReadOnly={false}
        value={youtube}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              key,
              desc,
              facebook,
              instagram,
              name,
              thumbnail,
              thumbnailKey,
              twitter,
              youtube: value,
            };
            const result = onChange(modelFields);
            value = result?.youtube ?? value;
          }
          if (errors.youtube?.hasError) {
            runValidationTasks("youtube", value);
          }
          setYoutube(value);
        }}
        onBlur={() => runValidationTasks("youtube", youtube)}
        errorMessage={errors.youtube?.errorMessage}
        hasError={errors.youtube?.hasError}
        {...getOverrideProps(overrides, "youtube")}
      ></TextField>
      <Flex
        justifyContent="space-between"
        {...getOverrideProps(overrides, "CTAFlex")}
      >
        <Button
          children="Reset"
          type="reset"
          onClick={(event) => {
            event.preventDefault();
            resetStateValues();
          }}
          isDisabled={!(keyProp || creatorModelProp)}
          {...getOverrideProps(overrides, "ResetButton")}
        ></Button>
        <Flex
          gap="15px"
          {...getOverrideProps(overrides, "RightAlignCTASubFlex")}
        >
          <Button
            children="Submit"
            type="submit"
            variation="primary"
            isDisabled={
              !(keyProp || creatorModelProp) ||
              Object.values(errors).some((e) => e?.hasError)
            }
            {...getOverrideProps(overrides, "SubmitButton")}
          ></Button>
        </Flex>
      </Flex>
    </Grid>
  );
}
