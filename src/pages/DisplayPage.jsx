import React, { useState } from "react";
import { Box, Stack } from "@mui/material";
import Navbar from "../components/navbar";
import DisplayWindow from "../components/DisplayWindow";
import PropertiesWindow from "../components/PropertiesWindow";

function DisplayPage() {
  const [cameraConnected, setCameraConnected] = useState(false);

  const handleCheckCamera = async () => {
    try {
      const response = await fetch("http://localhost:5000/camera-status");
      const data = await response.json();
      setCameraConnected(data.connected);
    } catch (error) {
      setCameraConnected(false);
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#C6C3C3",
        margin: 0,
        padding: 0,
      }}
    >
      <Navbar />

      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: 0,
          margin: 0,
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{
            width: "100%", // Keeps equal distance from edges
            maxWidth: "1200px", // Prevents stretching on large screens
            height: "80vh",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <PropertiesWindow
            cameraConnected={cameraConnected}
            handleCheckCamera={handleCheckCamera}
          />
          <DisplayWindow
            cameraConnected={cameraConnected}
            handleCheckCamera={handleCheckCamera}
          />
        </Stack>
      </Box>
    </Box>
  );
}

export default DisplayPage;
