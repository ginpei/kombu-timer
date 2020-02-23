import React, { useEffect, useState } from 'react';
import './TimerPage.scss';

type Participant = {
  name: string;
  key: string;
}

const participants: Participant[] = [
  {
    name: 'Alice',
    key: 'a',
  },
  {
    name: 'Bob',
    key: 'b',
  },
  {
    name: 'Charlie',
    key: 'c',
  },
  // {
  //   name: 'Dan',
  //   key: 'd',
  // },
]

type Timing = {
  datetime: number;
  key: string;
  participantId: string | null;
}

class TimingManager {
  private timings: Timing[] = [];

  get lastElapse(): number {
    const t = this.lastTiming;
    if (!t || t.participantId === null) {
      return 0;
    }
    return this.calculateElapse(t);
  }

  private get lastTiming(): Timing | null {
    return this.timings[this.timings.length - 1] || null;
  }

  add(participant: Participant | null) {
    const last = this.lastElapse;

    const timing = this.createTiming(participant);
    this.timings.push(timing);

    return last;
  }

  private createTiming(participant: Participant | null) {
    const timing: Timing = {
      datetime: Date.now(),
      key: Date.now().toString(),
      participantId: participant?.key ?? null,
    };

    return timing;
  }

  private calculateElapse(timing: Timing, now = Date.now()) {
    return now - timing.datetime;
  }
}

type ParticipantButtonProps = {
  active: boolean;
  elapse: number;
  onClick: (p: Participant) => void;
  participant: Participant;
}

const ParticipantButton: React.FC<ParticipantButtonProps> = (props) => {
  const onClick = () => props.onClick(props.participant);

  return (
    <button
      className="TimerPage-participantButton"
      data-active={props.active}
      onClick={onClick}
    >
      {props.participant.name} ({readableElapse(props.elapse)})
    </button>
  );
};

const TimerPage: React.FC = () => {
  const [timingMan] = useState(new TimingManager());
  const [elapses] = useState(prepareElapseList(participants));
  const [activeParticipant, setActiveParticipant] =
    useState<Participant | null>(null);

  const [activeElapse, setActiveElapse] = useState(0);
  useEffect(() => {
    setActiveElapse(0);

    if (!activeParticipant) {
      return;
    }

    const tm = window.setInterval(
      () => setActiveElapse(timingMan.lastElapse),
      16,
    );

    return () => window.clearInterval(tm);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeParticipant]);

  const onParticipantClick = (participant: Participant) => {
    if (participant === activeParticipant) {
      const elapse = timingMan.add(null);
      elapses[activeParticipant.key] += elapse;

      setActiveParticipant(null);
    } else {
      const elapse = timingMan.add(participant);
      if (activeParticipant) {
        elapses[activeParticipant.key] += elapse;
      }

      setActiveParticipant(participant);
    }
  };

  return (
    <div className="TimerPage">
      <header className="TimerPage-header">
        Timer
      </header>
      <div className="TimerPage-participantList">
        {participants.map((p) => {
          const active = p === activeParticipant;
          const elapse = elapses[p.key];
          const currentElapse = active
            ? elapse + activeElapse
            : elapse;
          return (
            <ParticipantButton
              active={active}
              elapse={currentElapse}
              key={p.key}
              onClick={onParticipantClick}
              participant={p}
            />
          );
        })}
      </div>
      <footer>
        footer
      </footer>
    </div>
  );
};

function prepareElapseList(participants: Participant[]) {
  return participants.reduce((list, participant) => {
    list[participant.key] = 0;
    return list;
  }, {} as Record<string, number>);
}

function readableElapse(ms: number) {
  if (ms === 0) {
    return '0';
  }

  const s = Math.floor(ms / 1000);
  if (s < 60) {
    return `${s} sec`
  }

  const m = Math.floor(s / 60);

  return `${m} min`;
}

export default TimerPage;
