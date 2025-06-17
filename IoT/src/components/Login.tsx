import { Component, type ChangeEvent, type FormEvent } from "react";
import { Navigate } from 'react-router-dom'
import { TextField, Button, Container, Typography, Alert, createTheme } from '@mui/material';
import { ThemeProvider } from "@emotion/react";
import axios from "axios";

interface Account {
    username: string;
    password: string;
}

interface Errors {
    username?: string;
    password?: string;
}

interface State {
    account: Account;
    errors: Errors;
    isLogged: Boolean;
}

interface LogEntry {
    id: number;
    action: string;
    timestamp: string;
}

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
});

class LoginForm extends Component<{}, State> {
    state: State = {
        account: {
            username: "",
            password: ""
        },
        errors: {},
        isLogged: false,
    };

    validate = (): Errors | null => {
        const errors: Errors = {};

        const { account } = this.state;
        if (account.username.trim() === '') {
            errors.username = 'Username is required!';
        }
        if (account.password.trim() === '') {
            errors.password = 'Password is required!';
        }

        return Object.keys(errors).length === 0 ? null : errors;
    };

    handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const errors = this.validate();
        this.setState({ errors: errors || {} });
        if (errors) return;

        console.log("submit - np. zapytanie do serwera");

        axios
            .post('http://localhost:3100/api/user/auth', {
                login: this.state.account.username,
                password: this.state.account.password
            })
            .then((response) => {
                if (response.data) {
                    console.log(response.data.token)
                    localStorage.setItem('token', response.data.token);
                    localStorage.setItem("name", this.state.account.username);
                    this.addLog("Logged in");
                    const isLogged = true;
                    this.setState({ isLogged });
                }
            })
            .catch((error) => {
                const errorMessages: Errors = {};
                errorMessages.password =
                    "Given username doesn't exist or the password is wrong!";
                this.setState({ errors: errorMessages || {} });
                console.log(error);
            })
    };

    handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const account = { ...this.state.account };
        account[event.currentTarget.name] = event.currentTarget.value;
        this.setState({ account });
    };

    private addLog = (action: string) => {
        const storedLogs = localStorage.getItem('userActivityLogs');
        const currentLogs: LogEntry[] = storedLogs ? JSON.parse(storedLogs) : [];

        const newLog: LogEntry = {
            id: Date.now() * Math.random() * 1000,
            action,
            timestamp: new Date().toISOString()
        };

        const updatedLogs = [newLog, ...currentLogs].slice(0, 50);

        localStorage.setItem('userActivityLogs', JSON.stringify(updatedLogs));
    };

    render() {
        if (this.state.isLogged) {
            return <Navigate to="/" replace />;
        }

        return (
            <ThemeProvider theme={darkTheme}>
                <Container maxWidth="sm">
                    <Typography variant="h4" component="h1" gutterBottom>
                        Login
                    </Typography>
                    <form onSubmit={this.handleSubmit}>
                        <div className="form-group">
                            <TextField
                                label="Username"
                                value={this.state.account.username}
                                name="username"
                                onChange={this.handleChange}
                                fullWidth
                                margin="normal"
                                variant="outlined"
                            />
                            {this.state.errors.username && (
                                <Alert severity="error">
                                    {this.state.errors.username}
                                </Alert>
                            )}
                        </div>
                        <div className="form-group">
                            <TextField
                                label="Password"
                                value={this.state.account.password}
                                name="password"
                                onChange={this.handleChange}
                                type="password"
                                fullWidth
                                margin="normal"
                                variant="outlined"
                            />
                            {this.state.errors.password && (
                                <Alert severity="error">
                                    {this.state.errors.password}
                                </Alert>
                            )}
                        </div>
                        <Button type="submit" variant="contained" color="primary" fullWidth>
                            Login
                        </Button>
                    </form>
                </Container>
            </ThemeProvider>
        );
    }
}

export default LoginForm;
