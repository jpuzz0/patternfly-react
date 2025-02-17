import * as React from 'react';
import Dropzone, { DropzoneProps, DropzoneInputProps, DropFileEventHandler } from 'react-dropzone';
import { FileUploadField, FileUploadFieldProps } from './FileUploadField';
import { readFile, fileReaderType } from '../../helpers/fileUtils';
import { fromEvent } from 'file-selector';

interface DropzoneInputPropsWithRef extends DropzoneInputProps {
  ref: React.RefCallback<HTMLInputElement>; // Working around an issue in react-dropzone 9.0.0's types. Should not be necessary in later versions.
}

/** The main file upload component with drag and drop functionality built in by default. */

export interface FileUploadProps
  extends Omit<
    FileUploadFieldProps,
    'children' | 'onBrowseButtonClick' | 'onClearButtonClick' | 'isDragActive' | 'containerRef'
  > {
  /** Flag to allow editing of a text file's contents after it is selected from disk. */
  allowEditingUploadedText?: boolean;
  /** Aria-label for the text area. */
  'aria-label'?: string;
  /** Text for the browse button. */
  browseButtonText?: string;
  /** Additional children to render after (or instead of) the file preview. */
  children?: React.ReactNode;
  /** Additional classes added to the file upload container element. */
  className?: string;
  /** Text for the clear button. */
  clearButtonText?: string;
  /** Value to be shown in the read-only filename field. */
  filename?: string;
  /** Aria-label for the read-only filename field. */
  filenameAriaLabel?: string;
  /** Placeholder string to display in the empty filename field. */
  filenamePlaceholder?: string;
  /** Flag to hide the built-in preview of the file (where available). If true, you can use
   * the children property to render an alternate preview.
   */
  hideDefaultPreview?: boolean;
  /** Unique id for the text area. Also used to generate ids for accessible labels. */
  id: string;
  /** Flag to show if the field is disabled. */
  isDisabled?: boolean;
  /** Flag to show if a file is being loaded. */
  isLoading?: boolean;
  /** Flag to show if the field is read only. */
  isReadOnly?: boolean;
  /** Flag to show if the field is required. */
  isRequired?: boolean;
  /** @deprecated A callback for when the file contents changes. Please instead use
   * onFileInputChange, onTextChange, onDataChange, and onClearClick individually.
   */
  onChange?: (
    value: string | File,
    filename: string,
    event:
      | React.MouseEvent<HTMLButtonElement, MouseEvent> // Clear button was clicked
      | React.DragEvent<HTMLElement> // User dragged/dropped a file
      | React.ChangeEvent<HTMLElement> // User typed in the TextArea
  ) => void;
  /** Callback for clicking on the file upload field text area. By default, prevents a click
   * in the text area from opening file dialog.
   */
  onClick?: (event: React.MouseEvent) => void;
  /** Change event emitted from the hidden \<input type="file" \> field associated with the component  */
  onFileInputChange?: (event: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLElement>, file: File) => void;
  /** Aria-valuetext for the loading spinner. */
  spinnerAriaValueText?: string;
  /** What type of file. Determines what is passed to the onChange property and what is
   * expected by the value property (a string for 'text' and 'dataURL', or a File object otherwise.
   */
  type?: 'text' | 'dataURL';
  /** Value to indicate if the field is modified to show that validation state.
   * If set to success, field will be modified to indicate valid state.
   * If set to error, field will be modified to indicate error state.
   */
  validated?: 'success' | 'error' | 'default';
  /** Value of the file's contents (string if text file, File object otherwise). */
  value?: string | File;

  // Props available in FileUpload but not FileUploadField:

  /** Optional extra props to customize react-dropzone. */
  dropzoneProps?: DropzoneProps;
  /** Clear button was clicked. */
  onClearClick?: React.MouseEventHandler<HTMLButtonElement>;
  /** On data changed - if type='text' or type='dataURL' and file was loaded it will call this method */
  onDataChange?: (data: string) => void;
  /** A callback for when the FileReader API fails. */
  onReadFailed?: (error: DOMException, fileHandle: File) => void;
  /** A callback for when a selected file finishes loading. */
  onReadFinished?: (fileHandle: File) => void;
  /** A callback for when a selected file starts loading. */
  onReadStarted?: (fileHandle: File) => void;
  /** Text area text changed. */
  onTextChange?: (text: string) => void;
}

export const FileUpload: React.FunctionComponent<FileUploadProps> = ({
  id,
  type,
  value = type === fileReaderType.text || type === fileReaderType.dataURL ? '' : null,
  filename = '',
  children = null,
  onChange = () => {},
  onFileInputChange = null,
  onReadStarted = () => {},
  onReadFinished = () => {},
  onReadFailed = () => {},
  onClearClick,
  onClick = event => event.preventDefault(),
  onTextChange,
  onDataChange,
  dropzoneProps = {},
  ...props
}: FileUploadProps) => {
  const onDropAccepted: DropFileEventHandler = (acceptedFiles, event) => {
    if (acceptedFiles.length > 0) {
      const fileHandle = acceptedFiles[0];
      if (event.type === 'drop') {
        onFileInputChange?.(event, fileHandle);
      }
      if (type === fileReaderType.text || type === fileReaderType.dataURL) {
        onChange('', fileHandle.name, event); // Show the filename while reading
        onReadStarted(fileHandle);
        readFile(fileHandle, type as fileReaderType)
          .then(data => {
            onReadFinished(fileHandle);
            onChange(data as string, fileHandle.name, event);
            onDataChange?.(data as string);
          })
          .catch((error: DOMException) => {
            onReadFailed(error, fileHandle);
            onReadFinished(fileHandle);
            onChange('', '', event); // Clear the filename field on a failure
            onDataChange?.('');
          });
      } else {
        onChange(fileHandle, fileHandle.name, event);
      }
    }
    dropzoneProps.onDropAccepted && dropzoneProps.onDropAccepted(acceptedFiles, event);
  };

  const onDropRejected: DropFileEventHandler = (rejectedFiles, event) => {
    if (rejectedFiles.length > 0) {
      onChange('', rejectedFiles[0].name, event);
    }
    dropzoneProps.onDropRejected && dropzoneProps.onDropRejected(rejectedFiles, event);
  };

  const fileInputRef = React.useRef<HTMLInputElement>();
  const setFileValue = (filename: string) => {
    fileInputRef.current.value = filename;
  };

  const onClearButtonClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    onChange('', '', event);
    onClearClick?.(event);
    setFileValue(null);
  };

  return (
    <Dropzone multiple={false} {...dropzoneProps} onDropAccepted={onDropAccepted} onDropRejected={onDropRejected}>
      {({ getRootProps, getInputProps, isDragActive, open }) => {
        const oldInputProps = getInputProps();
        const inputProps: DropzoneInputProps = {
          ...oldInputProps,
          onChange: async (e: React.ChangeEvent<HTMLInputElement>) => {
            oldInputProps.onChange?.(e);
            const files = await fromEvent(e.nativeEvent);
            if (files.length === 1) {
              onFileInputChange?.(e, files[0] as File);
            }
          }
        };

        return (
          <FileUploadField
            {...getRootProps({
              ...props,
              refKey: 'containerRef',
              onClick: event => event.preventDefault()
            })}
            tabIndex={null} // Omit the unwanted tabIndex from react-dropzone's getRootProps
            id={id}
            type={type}
            filename={filename}
            value={value}
            onChange={onChange}
            isDragActive={isDragActive}
            onBrowseButtonClick={open}
            onClearButtonClick={onClearButtonClick}
            onTextAreaClick={onClick}
            onTextChange={onTextChange}
          >
            <input
              /* hidden, necessary for react-dropzone */
              {...inputProps}
              ref={input => {
                fileInputRef.current = input;
                (inputProps as DropzoneInputPropsWithRef).ref(input);
              }}
            />
            {children}
          </FileUploadField>
        );
      }}
    </Dropzone>
  );
};
FileUpload.displayName = 'FileUpload';
