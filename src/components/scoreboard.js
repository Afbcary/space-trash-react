import React from "react"
import PropTypes from "prop-types"
import Score from "./score"

const ScoreBoard = (props) => {
  const scoreBoardStyle = {
    position: 'absolute',
    top: '30px',
    right: '30px',
    color: 'white',
    fontSize: '10px'
  };
  return (
    <div style={scoreBoardStyle}>
      <Score text={"High"} val={props.highScore}></Score>
      <Score text={"Current"} val={props.currScore}></Score>
      <button onClick={props.togglePause}>{props.paused ? 'unpause' : 'pause'}</button>
    </div>
  )
}

ScoreBoard.propTypes = {
  highScore: PropTypes.number.isRequired,
  currScore: PropTypes.number.isRequired,
  paused: PropTypes.bool.isRequired,
  togglePause: PropTypes.func.isRequired,
}

export default ScoreBoard
