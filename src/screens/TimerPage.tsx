import React from 'react';

type Participant = {
  name: string;
}

const participants: Participant[] = [
  {
    name: 'Alice',
  }
]

const TimerPage: React.FC = () => {
  return (
    <div className="TimerPage">
      <h1>Timer</h1>
    </div>
  );
};

export default TimerPage;
