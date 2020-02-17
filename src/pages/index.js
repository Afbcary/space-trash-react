import React from "react"

import ScoreBoard from "../components/scoreboard"
import Menu from "../components/menu"

export default class IndexPage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      highScore: 0,
      score: 0,
      paused: false,
      menuText: "Start",
      ship: null,
      asteroids: [],
      canvas: null,
      ctx: null,
      canvasWidth: 0,
      canvasHeight: 0,
    }
    
    this.togglePause = this.togglePause.bind(this)
    this.startGame = this.startGame.bind(this)
  }
  
  componentDidMount() {
    this.addOneAsteroidOnEachEdge()
    this.addOneAsteroidOnEachEdge()
    this.addOneAsteroidOnEachEdge()
    this.addOneAsteroidOnEachEdge()
    this.addOneAsteroidOnEachEdge()
    this.addOneAsteroidOnEachEdge()
    const interval = setInterval(() => {
      if (!this.state.paused) {
        this.drawSpace()
        this.drawShip()
        this.drawAsteroids()
      }
    }, 10)

    const canvas = this.refs.canvas

    this.setState({
      canvas: canvas,
      ctx: canvas.getContext("2d"),
      canvasWidth: (canvas.width = window.innerWidth),
      canvasHeight: (canvas.height = window.innerHeight),
      interval: interval,
    })
  }

  render() {
    return (
      <div style={{ height: "100%", width: "100%", backgroundColor: "black" }}>
        <canvas
          ref="canvas"
          style={{ height: "100%", width: "100%", backgroundColor: "black" }}
        ></canvas>
        <ScoreBoard
          highScore={this.state.highScore}
          currScore={this.state.score}
          paused={this.state.paused}
          togglePause={this.togglePause}
        ></ScoreBoard>
        {this.state.paused && (
          <Menu text={this.state.menuText} start={this.startGame}></Menu>
        )}
      </div>
    )
  }

  togglePause() {
    this.setState({
      paused: !this.state.paused,
    })
  }

  startGame() {
    const newShip = {
      x: 0,
      y: this.state.canvasHeight / 2,
      xVelocity: 2,
      yVelocity: 0,
      xAccel: 0,
      yAccel: 0,
      alive: true,
      size: 6,
      color: "#FFFF00",
    }

    const a1 = this.buildAsteroid()
    a1.x = (3 * this.state.canvasWidth) / 4
    const a2 = this.buildAsteroid()
    a2.x = (3 * this.state.canvasWidth) / 4
    const a3 = this.buildAsteroid()
    a3.x = this.state.canvasWidth / 2
    const a4 = this.buildAsteroid()
    a4.x = this.state.canvasWidth / 2
    const a5 = this.buildAsteroid()
    const asteroids = [a1, a2, a3, a4, a5]

    this.setState({
      ship: newShip,
      score: 0,
      paused: false,
      asteroids: asteroids,
    })
  }

  //TODO
  drawAsteroids() {
    for (let asteroid of this.state.asteroids) {
      this.bounceObjectOffWall(asteroid)
      asteroid.x +=
        asteroid.xGrow == null
          ? 0
          : asteroid.xGrow
          ? asteroid.speed
          : -asteroid.speed
      asteroid.y +=
        asteroid.yGrow == null
          ? 0
          : asteroid.yGrow
          ? asteroid.speed
          : -asteroid.speed
      this.drawObject(asteroid)
      if (this.state.ship && this.hasCollision(asteroid, this.state.ship)) {
        this.gameOver()
      }
    }
  }

  gameOver() {
    const newHighScore = Math.max(this.state.highScore, this.state.score)
    this.setState({
      paused: true,
      ship: null,
      menuText: "Play Again?",
      highScore: newHighScore,
    })
  }

  hasCollision(obj1, obj2) {
    const collisionDistance = obj1.size + obj2.size
    const xVector = Math.pow(obj1.x - obj2.x, 2)
    const yVector = Math.pow(obj1.y - obj2.y, 2)
    return Math.sqrt(xVector + yVector) < collisionDistance
  }

  drawSpace() {
    this.setState(state => {
      const ctx = state.ctx
      ctx.fillStyle = "rgba(0,0,0,0.5)" // 0.08
      ctx.fillRect(0, 0, this.state.canvasWidth, this.state.canvasHeight)
      return {
        ctx,
      }
    })
  }

  moveShip() {
    this.setState(state => {
      const s = state.ship
      const ctx = state.ctx

      s.xVelocity += s.xAccel
      s.yVelocity += s.yAccel
      s.x += s.xVelocity
      s.y += s.yVelocity

      ctx.lineWidth = 1
      ctx.fillStyle = s.color
      ctx.beginPath()
      ctx.moveTo(s.x - s.size / 2, s.y)
      ctx.arc(s.x, s.y, s.size, 0, 2 * Math.PI)
      ctx.fill()
      return {
        ship: s,
        ctx: ctx,
      }
    })
  }

  drawObject(obj) {
    this.setState(state => {
      const s = state.ship
      const ctx = state.ctx
      ctx.lineWidth = 1
      ctx.fillStyle = obj.color
      ctx.beginPath()
      ctx.moveTo(obj.x - obj.size / 2, obj.y)
      ctx.arc(obj.x, obj.y, obj.size, 0, 2 * Math.PI)
      ctx.fill()
      return {
        ship: s,
        ctx: ctx,
      }
    })
  }

  bounceShipOffWall() {
    this.setState(state => {
      const s = state.ship
      if (s.x - s.size <= 0) {
        s.xVelocity = 0.8 * Math.abs(s.xVelocity)
      }
      if (s.x + s.size >= state.canvasWidth) {
        s.xVelocity = -0.8 * Math.abs(s.xVelocity)
      }
      if (s.y - s.size <= 0) {
        s.yVelocity = 0.8 * Math.abs(s.yVelocity)
      }
      if (s.y + s.size >= state.canvasHeight) {
        s.yVelocity = -0.8 * Math.abs(s.yVelocity)
      }
      return {
        s,
      }
    })
  }

  //TODO
  bounceObjectOffWall(obj) {
    if (obj.x - obj.size <= 0) {
      obj.xGrow = true
    }
    if (obj.x + obj.size >= this.state.canvasWidth) {
      obj.xGrow = false
    }
    if (obj.y - obj.size <= 0) {
      obj.yGrow = true
    }
    if (obj.y + obj.size >= this.state.canvasHeight) {
      obj.yGrow = false
    }
  }

  drawShip() {
    if (this.state.ship && this.state.ship.alive) {
      this.bounceShipOffWall()
      this.moveShip()
      this.setState(state => {
        return {
          score: state.score++,
        }
      })
      if (this.state.score % 1000 === 0) {
        this.addOneAsteroidOnEachEdge()
      }
    }
  }

  // window.addEventListener("keydown", (e) => changeDirection(e, true), true);
  // window.addEventListener("keyup", (e) => changeDirection(e, false), true);

  // below : not used?
  // const accelerationMap = {};

  changeDirection(e, isKeyDown) {
    e = e || window.event
    this.setState(state => {
      const ship = state.ship

      if (e.keyCode === "38") {
        // up arrow
        ship.yAccel = isKeyDown ? -0.08 : 0
      } else if (e.keyCode === "40") {
        // down arrow
        ship.yAccel = isKeyDown ? 0.08 : 0
      } else if (e.keyCode === "37") {
        // left arrow
        ship.xAccel = isKeyDown ? -0.08 : 0
      } else if (e.keyCode === "39") {
        // right arrow
        ship.xAccel = isKeyDown ? 0.08 : 0
      }
      return {
        ship,
      }
    })
    e.preventDefault()
  }

  addOneAsteroidOnEachEdge() {
    const aTop = this.buildAsteroid()
    aTop.x = randomIntFromUniformDistribution(0, this.state.canvasWidth)
    aTop.y = 0
    const aRight = this.buildAsteroid()
    aRight.y = randomIntFromUniformDistribution(0, this.state.canvasHeight)
    aRight.x = this.state.canvasWidth
    const aDown = this.buildAsteroid()
    aDown.x = randomIntFromUniformDistribution(0, this.state.canvasWidth)
    aDown.y = this.state.canvasHeight
    const aLeft = this.buildAsteroid()
    aLeft.y = randomIntFromUniformDistribution(0, this.state.canvasHeight)
    aLeft.x = 0

    this.setState(state => {
      const asteroids = state.asteroids.concat(aTop, aRight, aDown, aLeft)
      return {
        asteroids,
      }
    })
  }
  buildAsteroid() {
    const randSpeed = randomIntFromUniformDistribution(1, 10) * 0.1
    const randSize = randomIntFromUniformDistribution(5, 50)
    return {
      size: randSize,
      x: this.state.canvasWidth,
      y: randomIntFromUniformDistribution(0, this.state.canvasHeight),
      xGrow: false,
      yGrow: false,
      speed: randSpeed,
      color: getAsteroidColor(),
    }
  }
}


function getAsteroidColor() {
  return `hsla(${randomIntFromUniformDistribution(113, 255)},100%,60%,1)`
}

// function formatRGBA(r, g, b, a) {
//   return `rgb(${r},${g},${b},${a})`
// }

// function rand255() {
//   return randomIntFromUniformDistribution(0, 255)
// }

function randomIntFromUniformDistribution(mn, mx) {
  return ~~(Math.random() * (mx - mn + 1) + mn)
}
