import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import {
  IconButton,
  InputAdornment,
  TextField,
  TextFieldProps,
} from '@mui/material';
import React, { useState, forwardRef } from 'react';

const PasswordTextField = forwardRef<HTMLInputElement, TextFieldProps>(
  (props, ref) => {
    const [show, setShow] = useState(false);

    const handleClickShowPassword = () => setShow(!show);

    const handleMouseDownPassword = (
      event: React.MouseEvent<HTMLButtonElement>
    ) => {
      event.preventDefault();
    };

    return (
      <TextField
        type={show ? 'text' : 'password'}
        inputRef={ref}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={handleClickShowPassword}
                onMouseDown={handleMouseDownPassword}
                edge="end"
              >
                {show ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </IconButton>
            </InputAdornment>
          ),
        }}
        {...props}
      />
    );
  }
);

PasswordTextField.displayName = 'PasswordTextField';

export default PasswordTextField;
