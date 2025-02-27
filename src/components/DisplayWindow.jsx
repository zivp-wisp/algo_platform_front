import React, { useEffect, useRef, useState } from "react";
import { Typography, Box, Stack, TextField, IconButton } from "@mui/material";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

const DisplayWindow = ({ cameraConnected, handleCheckCamera }) => {
  // const [terminalOutput, setTerminalOutput] = useState([]);
  const [graphImage, setGraphImage] = useState(null);
  const [temperature, setTemperature] = useState(null);
  // const [cameraConnected, setCameraConnected] = useState(null);
  const [cameraColor, setCameraColor] = useState("error");
  // const terminalRef = useRef(null);

  useEffect(() => {
    socket.on("script_output", (data) => {
      if (data.type === "terminal") {
        if (data.data.startsWith("temperature=")) {
          const tempValue = data.data.split("=")[1].trim();
          setTemperature(tempValue);
        } else {
          setTerminalOutput((prev) => [...prev, data.data]);
        }
      } else if (data.type === "image") {
        setGraphImage(`data:image/png;base64,${data.data}`);
      }
    });
    return () => {
      socket.off("script_output");
    };
  }, []);

  // // Auto-scroll terminal container to bottom when new output is added.
  // useEffect(() => {
  //   if (terminalRef.current) {
  //     terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
  //   }
  // }, [terminalOutput]);

  useEffect(() => {
    setCameraColor(cameraConnected ? "success" : "error");
  }, [cameraConnected]);

  return (
    <Stack
      display={"flex"}
      flexDirection={"column"}
      sx={{
        height: "100%",
        width: "80%",
        borderRadius: 2,
        padding: 2,
        background: "#FFFFFF",
      }}
      spacing={2}
      alignItems={"center"}
      justifyContent={"space-between"}
    >
      <Box
        sx={{
          width: "95%",
          borderRadius: 2,
          height: "65%",
          padding: 2,
          background: "#000000",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {graphImage ? (
          <img
            src={graphImage}
            alt="Graph Output"
            style={{ width: "100%", height: "100%", objectFit: "fill" }}
          />
        ) : (
          <div style={{ color: "white" }}>
            Run the algorithm to show live stream
          </div>
        )}
      </Box>
      <Stack
        direction="row"
        height="15%"
        spacing={2}
        justifyContent="space-between"
        alignItems="start"
        sx={{ width: "95%" }}
      >
        <TextField
          label="Temperature"
          variant="outlined"
          value={temperature !== null ? temperature : "Waiting for data..."}
          slotProps={{ readOnly: true }}
          sx={{ width: "50%" }}
        />
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          sx={{ width: "30%" }}
        >
          <IconButton
            variant="contained"
            color={cameraColor}
            onClick={handleCheckCamera}
          >
            <CameraAltIcon />
          </IconButton>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {cameraConnected ? (
              <Typography color="green">Connected</Typography>
            ) : (
              <Typography color="red">Disconnected</Typography>
            )}
          </Box>
        </Stack>
      </Stack>
      {/* <Box
        ref={terminalRef} // Attach the ref to the terminal container
        sx={{
          width: "95%",
          height: "30%",
          borderRadius: 2,
          padding: 2,
          background: "black",
          overflowY: "auto", // Allows scrolling
          border: "2px solid black",
        }}
      >
        {terminalOutput.map((line, index) => (
          <Typography
            key={index}
            sx={{
              color: "white",
              marginBottom: "4px",
              fontWeight: 300, // Set lighter font weight
              fontSize: "14px", // Adjust the font size if needed
              fontFamily: "monospace", // Ensures a terminal-like appearance
            }}
          >
            {line}
          </Typography>
        ))}
      </Box> */}
    </Stack>
  );
};

export default DisplayWindow;
