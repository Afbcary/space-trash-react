import React from "react"
import PropTypes from "prop-types"

const Score = (props) => {
  return (
    <>
      <div>{props.text}</div>
      <div>{props.val}</div>
    </>
  )
}

Score.propTypes = {
  text: PropTypes.string.isRequired,
  val: PropTypes.number.isRequired,
}

export default Score
