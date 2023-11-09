/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

/* eslint-disable */
import * as React from "react";
import {
  Badge,
  Button,
  Divider,
  Flex,
  Grid,
  Icon,
  ScrollView,
  Text,
  TextField,
  useTheme,
} from "@aws-amplify/ui-react";
import { getOverrideProps } from "@aws-amplify/ui-react/internal";
import { Song } from "../models";
import { fetchByPath, validateField } from "./utils";
import { DataStore } from "aws-amplify";
function ArrayField({
  items = [],
  onChange,
  label,
  inputFieldRef,
  children,
  hasError,
  setFieldValue,
  currentFieldValue,
  defaultFieldValue,
  lengthLimit,
  getBadgeText,
  errorMessage,
}) {
  const labelElement = <Text>{label}</Text>;
  const {
    tokens: {
      components: {
        fieldmessages: { error: errorStyles },
      },
    },
  } = useTheme();
  const [selectedBadgeIndex, setSelectedBadgeIndex] = React.useState();
  const [isEditing, setIsEditing] = React.useState();
  React.useEffect(() => {
    if (isEditing) {
      inputFieldRef?.current?.focus();
    }
  }, [isEditing]);
  const removeItem = async (removeIndex) => {
    const newItems = items.filter((value, index) => index !== removeIndex);
    await onChange(newItems);
    setSelectedBadgeIndex(undefined);
  };
  const addItem = async () => {
    if (
      currentFieldValue !== undefined &&
      currentFieldValue !== null &&
      currentFieldValue !== "" &&
      !hasError
    ) {
      const newItems = [...items];
      if (selectedBadgeIndex !== undefined) {
        newItems[selectedBadgeIndex] = currentFieldValue;
        setSelectedBadgeIndex(undefined);
      } else {
        newItems.push(currentFieldValue);
      }
      await onChange(newItems);
      setIsEditing(false);
    }
  };
  const arraySection = (
    <React.Fragment>
      {!!items?.length && (
        <ScrollView height="inherit" width="inherit" maxHeight={"7rem"}>
          {items.map((value, index) => {
            return (
              <Badge
                key={index}
                style={{
                  cursor: "pointer",
                  alignItems: "center",
                  marginRight: 3,
                  marginTop: 3,
                  backgroundColor:
                    index === selectedBadgeIndex ? "#B8CEF9" : "",
                }}
                onClick={() => {
                  setSelectedBadgeIndex(index);
                  setFieldValue(items[index]);
                  setIsEditing(true);
                }}
              >
                {getBadgeText ? getBadgeText(value) : value.toString()}
                <Icon
                  style={{
                    cursor: "pointer",
                    paddingLeft: 3,
                    width: 20,
                    height: 20,
                  }}
                  viewBox={{ width: 20, height: 20 }}
                  paths={[
                    {
                      d: "M10 10l5.09-5.09L10 10l5.09 5.09L10 10zm0 0L4.91 4.91 10 10l-5.09 5.09L10 10z",
                      stroke: "black",
                    },
                  ]}
                  ariaLabel="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    removeItem(index);
                  }}
                />
              </Badge>
            );
          })}
        </ScrollView>
      )}
      <Divider orientation="horizontal" marginTop={5} />
    </React.Fragment>
  );
  if (lengthLimit !== undefined && items.length >= lengthLimit && !isEditing) {
    return (
      <React.Fragment>
        {labelElement}
        {arraySection}
      </React.Fragment>
    );
  }
  return (
    <React.Fragment>
      {labelElement}
      {isEditing && children}
      {!isEditing ? (
        <>
          <Button
            onClick={() => {
              setIsEditing(true);
            }}
          >
            Add item
          </Button>
          {errorMessage && hasError && (
            <Text color={errorStyles.color} fontSize={errorStyles.fontSize}>
              {errorMessage}
            </Text>
          )}
        </>
      ) : (
        <Flex justifyContent="flex-end">
          {(currentFieldValue || isEditing) && (
            <Button
              children="Cancel"
              type="button"
              size="small"
              onClick={() => {
                setFieldValue(defaultFieldValue);
                setIsEditing(false);
                setSelectedBadgeIndex(undefined);
              }}
            ></Button>
          )}
          <Button
            size="small"
            variation="link"
            isDisabled={hasError}
            onClick={addItem}
          >
            {selectedBadgeIndex !== undefined ? "Save" : "Add"}
          </Button>
        </Flex>
      )}
      {arraySection}
    </React.Fragment>
  );
}
export default function SongUpdateForm(props) {
  const {
    key: keyProp,
    song: songModelProp,
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
    fileUrl: "",
    fileKey: "",
    listens: [],
    trendingListens: [],
    listOfUidDownVotes: [],
    listOfUidUpVotes: [],
    name: "",
    partOf: "",
    selectedCategory: "",
    selectedCreator: "",
    thumbnail: "",
    thumbnailKey: "",
  };
  const [key, setKey] = React.useState(initialValues.key);
  const [fileUrl, setFileUrl] = React.useState(initialValues.fileUrl);
  const [fileKey, setFileKey] = React.useState(initialValues.fileKey);
  const [listens, setListens] = React.useState(initialValues.listens);
  const [trendingListens, setTrendingListens] = React.useState(
    initialValues.trendingListens
  );
  const [listOfUidDownVotes, setListOfUidDownVotes] = React.useState(
    initialValues.listOfUidDownVotes
  );
  const [listOfUidUpVotes, setListOfUidUpVotes] = React.useState(
    initialValues.listOfUidUpVotes
  );
  const [name, setName] = React.useState(initialValues.name);
  const [partOf, setPartOf] = React.useState(initialValues.partOf);
  const [selectedCategory, setSelectedCategory] = React.useState(
    initialValues.selectedCategory
  );
  const [selectedCreator, setSelectedCreator] = React.useState(
    initialValues.selectedCreator
  );
  const [thumbnail, setThumbnail] = React.useState(initialValues.thumbnail);
  const [thumbnailKey, setThumbnailKey] = React.useState(
    initialValues.thumbnailKey
  );
  const [errors, setErrors] = React.useState({});
  const resetStateValues = () => {
    const cleanValues = songRecord
      ? { ...initialValues, ...songRecord }
      : initialValues;
    setKey(cleanValues.key);
    setFileUrl(cleanValues.fileUrl);
    setFileKey(cleanValues.fileKey);
    setListens(cleanValues.listens ?? []);
    setCurrentListensValue("");
    setTrendingListens(cleanValues.trendingListens ?? []);
    setCurrentTrendingListensValue("");
    setListOfUidDownVotes(cleanValues.listOfUidDownVotes ?? []);
    setCurrentListOfUidDownVotesValue("");
    setListOfUidUpVotes(cleanValues.listOfUidUpVotes ?? []);
    setCurrentListOfUidUpVotesValue("");
    setName(cleanValues.name);
    setPartOf(cleanValues.partOf);
    setSelectedCategory(cleanValues.selectedCategory);
    setSelectedCreator(cleanValues.selectedCreator);
    setThumbnail(cleanValues.thumbnail);
    setThumbnailKey(cleanValues.thumbnailKey);
    setErrors({});
  };
  const [songRecord, setSongRecord] = React.useState(songModelProp);
  React.useEffect(() => {
    const queryData = async () => {
      const record = keyProp
        ? await DataStore.query(Song, keyProp)
        : songModelProp;
      setSongRecord(record);
    };
    queryData();
  }, [keyProp, songModelProp]);
  React.useEffect(resetStateValues, [songRecord]);
  const [currentListensValue, setCurrentListensValue] = React.useState("");
  const listensRef = React.createRef();
  const [currentTrendingListensValue, setCurrentTrendingListensValue] =
    React.useState("");
  const trendingListensRef = React.createRef();
  const [currentListOfUidDownVotesValue, setCurrentListOfUidDownVotesValue] =
    React.useState("");
  const listOfUidDownVotesRef = React.createRef();
  const [currentListOfUidUpVotesValue, setCurrentListOfUidUpVotesValue] =
    React.useState("");
  const listOfUidUpVotesRef = React.createRef();
  const validations = {
    key: [{ type: "Required" }],
    fileUrl: [{ type: "Required" }],
    fileKey: [{ type: "Required" }],
    listens: [],
    trendingListens: [],
    listOfUidDownVotes: [],
    listOfUidUpVotes: [],
    name: [{ type: "Required" }],
    partOf: [],
    selectedCategory: [{ type: "Required" }],
    selectedCreator: [],
    thumbnail: [{ type: "Required" }],
    thumbnailKey: [{ type: "Required" }],
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
          fileUrl,
          fileKey,
          listens,
          trendingListens,
          listOfUidDownVotes,
          listOfUidUpVotes,
          name,
          partOf,
          selectedCategory,
          selectedCreator,
          thumbnail,
          thumbnailKey,
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
            Song.copyOf(songRecord, (updated) => {
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
      {...getOverrideProps(overrides, "SongUpdateForm")}
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
              fileUrl,
              fileKey,
              listens,
              trendingListens,
              listOfUidDownVotes,
              listOfUidUpVotes,
              name,
              partOf,
              selectedCategory,
              selectedCreator,
              thumbnail,
              thumbnailKey,
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
        label="File url"
        isRequired={true}
        isReadOnly={false}
        value={fileUrl}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              key,
              fileUrl: value,
              fileKey,
              listens,
              trendingListens,
              listOfUidDownVotes,
              listOfUidUpVotes,
              name,
              partOf,
              selectedCategory,
              selectedCreator,
              thumbnail,
              thumbnailKey,
            };
            const result = onChange(modelFields);
            value = result?.fileUrl ?? value;
          }
          if (errors.fileUrl?.hasError) {
            runValidationTasks("fileUrl", value);
          }
          setFileUrl(value);
        }}
        onBlur={() => runValidationTasks("fileUrl", fileUrl)}
        errorMessage={errors.fileUrl?.errorMessage}
        hasError={errors.fileUrl?.hasError}
        {...getOverrideProps(overrides, "fileUrl")}
      ></TextField>
      <TextField
        label="File key"
        isRequired={true}
        isReadOnly={false}
        value={fileKey}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              key,
              fileUrl,
              fileKey: value,
              listens,
              trendingListens,
              listOfUidDownVotes,
              listOfUidUpVotes,
              name,
              partOf,
              selectedCategory,
              selectedCreator,
              thumbnail,
              thumbnailKey,
            };
            const result = onChange(modelFields);
            value = result?.fileKey ?? value;
          }
          if (errors.fileKey?.hasError) {
            runValidationTasks("fileKey", value);
          }
          setFileKey(value);
        }}
        onBlur={() => runValidationTasks("fileKey", fileKey)}
        errorMessage={errors.fileKey?.errorMessage}
        hasError={errors.fileKey?.hasError}
        {...getOverrideProps(overrides, "fileKey")}
      ></TextField>
      <ArrayField
        onChange={async (items) => {
          let values = items;
          if (onChange) {
            const modelFields = {
              key,
              fileUrl,
              fileKey,
              listens: values,
              trendingListens,
              listOfUidDownVotes,
              listOfUidUpVotes,
              name,
              partOf,
              selectedCategory,
              selectedCreator,
              thumbnail,
              thumbnailKey,
            };
            const result = onChange(modelFields);
            values = result?.listens ?? values;
          }
          setListens(values);
          setCurrentListensValue("");
        }}
        currentFieldValue={currentListensValue}
        label={"Listens"}
        items={listens}
        hasError={errors?.listens?.hasError}
        errorMessage={errors?.listens?.errorMessage}
        setFieldValue={setCurrentListensValue}
        inputFieldRef={listensRef}
        defaultFieldValue={""}
      >
        <TextField
          label="Listens"
          isRequired={false}
          isReadOnly={false}
          value={currentListensValue}
          onChange={(e) => {
            let { value } = e.target;
            if (errors.listens?.hasError) {
              runValidationTasks("listens", value);
            }
            setCurrentListensValue(value);
          }}
          onBlur={() => runValidationTasks("listens", currentListensValue)}
          errorMessage={errors.listens?.errorMessage}
          hasError={errors.listens?.hasError}
          ref={listensRef}
          labelHidden={true}
          {...getOverrideProps(overrides, "listens")}
        ></TextField>
      </ArrayField>
      <ArrayField
        onChange={async (items) => {
          let values = items;
          if (onChange) {
            const modelFields = {
              key,
              fileUrl,
              fileKey,
              listens,
              trendingListens: values,
              listOfUidDownVotes,
              listOfUidUpVotes,
              name,
              partOf,
              selectedCategory,
              selectedCreator,
              thumbnail,
              thumbnailKey,
            };
            const result = onChange(modelFields);
            values = result?.trendingListens ?? values;
          }
          setTrendingListens(values);
          setCurrentTrendingListensValue("");
        }}
        currentFieldValue={currentTrendingListensValue}
        label={"Trending listens"}
        items={trendingListens}
        hasError={errors?.trendingListens?.hasError}
        errorMessage={errors?.trendingListens?.errorMessage}
        setFieldValue={setCurrentTrendingListensValue}
        inputFieldRef={trendingListensRef}
        defaultFieldValue={""}
      >
        <TextField
          label="Trending listens"
          isRequired={false}
          isReadOnly={false}
          value={currentTrendingListensValue}
          onChange={(e) => {
            let { value } = e.target;
            if (errors.trendingListens?.hasError) {
              runValidationTasks("trendingListens", value);
            }
            setCurrentTrendingListensValue(value);
          }}
          onBlur={() =>
            runValidationTasks("trendingListens", currentTrendingListensValue)
          }
          errorMessage={errors.trendingListens?.errorMessage}
          hasError={errors.trendingListens?.hasError}
          ref={trendingListensRef}
          labelHidden={true}
          {...getOverrideProps(overrides, "trendingListens")}
        ></TextField>
      </ArrayField>
      <ArrayField
        onChange={async (items) => {
          let values = items;
          if (onChange) {
            const modelFields = {
              key,
              fileUrl,
              fileKey,
              listens,
              trendingListens,
              listOfUidDownVotes: values,
              listOfUidUpVotes,
              name,
              partOf,
              selectedCategory,
              selectedCreator,
              thumbnail,
              thumbnailKey,
            };
            const result = onChange(modelFields);
            values = result?.listOfUidDownVotes ?? values;
          }
          setListOfUidDownVotes(values);
          setCurrentListOfUidDownVotesValue("");
        }}
        currentFieldValue={currentListOfUidDownVotesValue}
        label={"List of uid down votes"}
        items={listOfUidDownVotes}
        hasError={errors?.listOfUidDownVotes?.hasError}
        errorMessage={errors?.listOfUidDownVotes?.errorMessage}
        setFieldValue={setCurrentListOfUidDownVotesValue}
        inputFieldRef={listOfUidDownVotesRef}
        defaultFieldValue={""}
      >
        <TextField
          label="List of uid down votes"
          isRequired={false}
          isReadOnly={false}
          value={currentListOfUidDownVotesValue}
          onChange={(e) => {
            let { value } = e.target;
            if (errors.listOfUidDownVotes?.hasError) {
              runValidationTasks("listOfUidDownVotes", value);
            }
            setCurrentListOfUidDownVotesValue(value);
          }}
          onBlur={() =>
            runValidationTasks(
              "listOfUidDownVotes",
              currentListOfUidDownVotesValue
            )
          }
          errorMessage={errors.listOfUidDownVotes?.errorMessage}
          hasError={errors.listOfUidDownVotes?.hasError}
          ref={listOfUidDownVotesRef}
          labelHidden={true}
          {...getOverrideProps(overrides, "listOfUidDownVotes")}
        ></TextField>
      </ArrayField>
      <ArrayField
        onChange={async (items) => {
          let values = items;
          if (onChange) {
            const modelFields = {
              key,
              fileUrl,
              fileKey,
              listens,
              trendingListens,
              listOfUidDownVotes,
              listOfUidUpVotes: values,
              name,
              partOf,
              selectedCategory,
              selectedCreator,
              thumbnail,
              thumbnailKey,
            };
            const result = onChange(modelFields);
            values = result?.listOfUidUpVotes ?? values;
          }
          setListOfUidUpVotes(values);
          setCurrentListOfUidUpVotesValue("");
        }}
        currentFieldValue={currentListOfUidUpVotesValue}
        label={"List of uid up votes"}
        items={listOfUidUpVotes}
        hasError={errors?.listOfUidUpVotes?.hasError}
        errorMessage={errors?.listOfUidUpVotes?.errorMessage}
        setFieldValue={setCurrentListOfUidUpVotesValue}
        inputFieldRef={listOfUidUpVotesRef}
        defaultFieldValue={""}
      >
        <TextField
          label="List of uid up votes"
          isRequired={false}
          isReadOnly={false}
          value={currentListOfUidUpVotesValue}
          onChange={(e) => {
            let { value } = e.target;
            if (errors.listOfUidUpVotes?.hasError) {
              runValidationTasks("listOfUidUpVotes", value);
            }
            setCurrentListOfUidUpVotesValue(value);
          }}
          onBlur={() =>
            runValidationTasks("listOfUidUpVotes", currentListOfUidUpVotesValue)
          }
          errorMessage={errors.listOfUidUpVotes?.errorMessage}
          hasError={errors.listOfUidUpVotes?.hasError}
          ref={listOfUidUpVotesRef}
          labelHidden={true}
          {...getOverrideProps(overrides, "listOfUidUpVotes")}
        ></TextField>
      </ArrayField>
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
              fileUrl,
              fileKey,
              listens,
              trendingListens,
              listOfUidDownVotes,
              listOfUidUpVotes,
              name: value,
              partOf,
              selectedCategory,
              selectedCreator,
              thumbnail,
              thumbnailKey,
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
        label="Part of"
        isRequired={false}
        isReadOnly={false}
        value={partOf}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              key,
              fileUrl,
              fileKey,
              listens,
              trendingListens,
              listOfUidDownVotes,
              listOfUidUpVotes,
              name,
              partOf: value,
              selectedCategory,
              selectedCreator,
              thumbnail,
              thumbnailKey,
            };
            const result = onChange(modelFields);
            value = result?.partOf ?? value;
          }
          if (errors.partOf?.hasError) {
            runValidationTasks("partOf", value);
          }
          setPartOf(value);
        }}
        onBlur={() => runValidationTasks("partOf", partOf)}
        errorMessage={errors.partOf?.errorMessage}
        hasError={errors.partOf?.hasError}
        {...getOverrideProps(overrides, "partOf")}
      ></TextField>
      <TextField
        label="Selected category"
        isRequired={true}
        isReadOnly={false}
        value={selectedCategory}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              key,
              fileUrl,
              fileKey,
              listens,
              trendingListens,
              listOfUidDownVotes,
              listOfUidUpVotes,
              name,
              partOf,
              selectedCategory: value,
              selectedCreator,
              thumbnail,
              thumbnailKey,
            };
            const result = onChange(modelFields);
            value = result?.selectedCategory ?? value;
          }
          if (errors.selectedCategory?.hasError) {
            runValidationTasks("selectedCategory", value);
          }
          setSelectedCategory(value);
        }}
        onBlur={() => runValidationTasks("selectedCategory", selectedCategory)}
        errorMessage={errors.selectedCategory?.errorMessage}
        hasError={errors.selectedCategory?.hasError}
        {...getOverrideProps(overrides, "selectedCategory")}
      ></TextField>
      <TextField
        label="Selected creator"
        isRequired={false}
        isReadOnly={false}
        value={selectedCreator}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              key,
              fileUrl,
              fileKey,
              listens,
              trendingListens,
              listOfUidDownVotes,
              listOfUidUpVotes,
              name,
              partOf,
              selectedCategory,
              selectedCreator: value,
              thumbnail,
              thumbnailKey,
            };
            const result = onChange(modelFields);
            value = result?.selectedCreator ?? value;
          }
          if (errors.selectedCreator?.hasError) {
            runValidationTasks("selectedCreator", value);
          }
          setSelectedCreator(value);
        }}
        onBlur={() => runValidationTasks("selectedCreator", selectedCreator)}
        errorMessage={errors.selectedCreator?.errorMessage}
        hasError={errors.selectedCreator?.hasError}
        {...getOverrideProps(overrides, "selectedCreator")}
      ></TextField>
      <TextField
        label="Thumbnail"
        isRequired={true}
        isReadOnly={false}
        value={thumbnail}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              key,
              fileUrl,
              fileKey,
              listens,
              trendingListens,
              listOfUidDownVotes,
              listOfUidUpVotes,
              name,
              partOf,
              selectedCategory,
              selectedCreator,
              thumbnail: value,
              thumbnailKey,
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
        isRequired={true}
        isReadOnly={false}
        value={thumbnailKey}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              key,
              fileUrl,
              fileKey,
              listens,
              trendingListens,
              listOfUidDownVotes,
              listOfUidUpVotes,
              name,
              partOf,
              selectedCategory,
              selectedCreator,
              thumbnail,
              thumbnailKey: value,
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
          isDisabled={!(keyProp || songModelProp)}
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
              !(keyProp || songModelProp) ||
              Object.values(errors).some((e) => e?.hasError)
            }
            {...getOverrideProps(overrides, "SubmitButton")}
          ></Button>
        </Flex>
      </Flex>
    </Grid>
  );
}
