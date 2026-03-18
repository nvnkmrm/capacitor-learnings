import React from "react";
import {
  Box,
  Button,
  Container,
  CssBaseline,
  ThemeProvider,
  Typography,
  createTheme,
} from "@mui/material";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
});

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            gap: 3,
          }}
        >
          <Typography variant="h3" component="h1" gutterBottom>
            Capacitor Exploration
          </Typography>
          <Typography variant="h6" color="text.secondary">
            React + TypeScript + Webpack + MUI
          </Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button variant="contained" color="primary">
              Primary
            </Button>
            <Button variant="contained" color="secondary">
              Secondary
            </Button>
            <Button variant="outlined" color="primary">
              Outlined
            </Button>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default App;
