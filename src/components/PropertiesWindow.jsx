import React, { useEffect, useState } from "react";
import {
  Paper,
  Typography,
  Button,
  Stack,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
  DialogActions,
} from "@mui/material";
import axios from "axios";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

const PropertiesWindow = ({ cameraConnected, handleCheckCamera }) => {
  const algorithms = [
    {
      value: "statistics",
      label: "Statistics",
      params: [{ label: "NumberOfTests", defaultVal: 4 }],
    },
    { value: "raw", label: "Raw Raman", params: [] },
    { value: "synthetic", label: "Synthetic Raman", params: [] },
  ];

  const [algorithmChosen, setAlgorithmChosen] = useState(""); // Store chosen algorithm
  const [paramsValues, setParamsValues] = useState({}); // Store parameter values
  const [dialogOpen, setDialogOpen] = useState(false); // Dialog state
  const [progress, setProgress] = useState(0); // Progress percentage
  const [totalIterations, setTotalIterations] = useState(1); // Total iterations

  // Update the selected algorithm and reset params
  const handleAlgorithmChange = (event) => {
    const selectedAlgo = event.target.value;
    setAlgorithmChosen(selectedAlgo);

    // Find the algorithm object & set default params
    const selectedAlgorithm = algorithms.find(
      (algo) => algo.value === selectedAlgo
    );
    if (selectedAlgorithm) {
      const defaultParams = {};
      selectedAlgorithm.params.forEach((param) => {
        defaultParams[param.label] = param.defaultVal || "";
      });
      setParamsValues(defaultParams);
    } else {
      setParamsValues({});
    }
  };

  useEffect(() => {
    socket.on("script_output", (data) => {
      if (data.type === "terminal" && data.data.startsWith("iteration=")) {
        const currentIteration = parseInt(data.data.split("=")[1].trim(), 10);
        setProgress((currentIteration / totalIterations) * 100);
      }

      if (data.type === "terminal" && data.data.startsWith("File saved")) {
        setDialogOpen(false);
      }
    });

    return () => {
      socket.off("script_output");
    };
  }, [totalIterations]);

  // Handle parameter value changes
  const handleParamChange = (paramName, event) => {
    setParamsValues({ ...paramsValues, [paramName]: event.target.value });
  };

  // Function to start the algorithm
  const handleRunAlgorithm = async () => {
    if (!algorithmChosen) {
      alert("Please choose an algorithm");
      return;
    } else if (!cameraConnected) {
      alert("Please update camera status");
      return;
    }

    if (algorithmChosen === "statistics") {
      setTotalIterations(paramsValues["NumberOfTests"] || 1); // Get iteration count
      setProgress(0); // Reset progress
      setDialogOpen(true);
    }

    try {
      // Send algorithm and params to backend
      const response = await axios.post("http://localhost:5000/start_script", {
        algo: algorithmChosen,
        params: paramsValues,
      });
      console.log("Algorithm started:", response.data);
    } catch (error) {
      console.error("Error starting algorithm:", error);
    }
  };

  const handleStopAlgorithm = async () => {
    try {
      // Send algorithm and params to backend
      const response = await axios.post("http://localhost:5000/stop_script");
      console.log("Algorithm stopped");
      setDialogOpen(false);
    } catch (error) {
      console.error("Error stopping algorithm:", error);
    }
  };

  return (
    <Paper
      sx={{
        height: "100%",
        width: "20%",
        borderRadius: 2,
        padding: 2,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {/* Algorithm Selection */}
      <Stack spacing={2}>
        <TextField
          id="algorithm-select"
          select
          label="Algorithm"
          value={algorithmChosen}
          onChange={handleAlgorithmChange}
        >
          {algorithms.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
        <Typography variant="h6" gutterBottom>
          Algorithm Parameters
        </Typography>
        {/* Dynamically Generated Parameter Fields */}
        {algorithmChosen && (
          <>
            {algorithms
              .find((algo) => algo.value === algorithmChosen)
              ?.params.map((param, index) => (
                <TextField
                  key={index}
                  label={param.label}
                  type="number"
                  value={paramsValues[param.label] || ""}
                  onChange={(e) => handleParamChange(param.label, e)}
                />
              ))}
          </>
        )}
      </Stack>

      {/* Control Buttons */}
      <Stack spacing={2}>
        <Button
          variant="contained"
          color="success"
          onClick={handleRunAlgorithm}
        >
          Run Algorithm
        </Button>
        <Button variant="contained" color="error" onClick={handleStopAlgorithm}>
          Stop Algorithm
        </Button>
      </Stack>
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Running Statistics</DialogTitle>
        <DialogContent>
          <Typography variant="body1">Please wait...</Typography>
          <Stack direction="column" alignItems="center" spacing={2} mt={2}>
            <CircularProgress variant="determinate" value={progress} />
            <Typography variant="body2">{Math.round(progress)}%</Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleStopAlgorithm} color="error">
            Stop
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default PropertiesWindow;
