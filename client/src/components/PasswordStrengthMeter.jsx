import { useState, useEffect } from 'react';
import zxcvbn from 'zxcvbn';
import { LinearProgress, Typography, Box } from '@mui/material';

const PasswordStrengthMeter = ({ password }) => {
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState([]);

  useEffect(() => {
    if (password) {
      const result = zxcvbn(password);
      setScore(result.score);
      setFeedback(result.feedback.suggestions);
    } else {
      setScore(0);
      setFeedback([]);
    }
  }, [password]);

  const getColor = () => {
    switch (score) {
      case 0:
        return '#ff4d4d';
      case 1:
        return '#ffa64d';
      case 2:
        return '#ffd700';
      case 3:
        return '#90EE90';
      case 4:
        return '#32CD32';
      default:
        return '#e0e0e0';
    }
  };

  const getLabel = () => {
    switch (score) {
      case 0:
        return 'Very Weak';
      case 1:
        return 'Weak';
      case 2:
        return 'Fair';
      case 3:
        return 'Good';
      case 4:
        return 'Strong';
      default:
        return 'None';
    }
  };

  return (
    <Box sx={{ width: '100%', mt: 1 }}>
      <LinearProgress
        variant="determinate"
        value={(score * 100) / 4}
        sx={{
          height: 8,
          borderRadius: 5,
          backgroundColor: '#e0e0e0',
          '& .MuiLinearProgress-bar': {
            backgroundColor: getColor(),
            borderRadius: 5,
          },
        }}
      />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
        <Typography variant="caption" color="textSecondary">
          Strength: {getLabel()}
        </Typography>
      </Box>
      {feedback.length > 0 && (
        <Box sx={{ mt: 1 }}>
          <Typography variant="caption" color="error">
            Suggestions:
            <ul className="list-disc pl-5">
              {feedback.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default PasswordStrengthMeter; 