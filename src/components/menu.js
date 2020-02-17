import React from "react"
import PropTypes from "prop-types"

const Menu = (props) => {
  const menuStyle = {
    position: 'absolute',
    top: '50%',
    right: '50%',
    height: '200px',
    width: '200px',
    margin: '-100px -100px 0 0',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };
  return (
    <div style={menuStyle}>
      <button onClick={props.start}>{props.text}</button>
    </div>
  )
}

Menu.propTypes = {
  text: PropTypes.string.isRequired,
  start: PropTypes.func.isRequired,
}

export default Menu
