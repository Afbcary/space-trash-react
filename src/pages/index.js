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
      trash: [],
      canvas: null,
      ctx: null,
      canvasWidth: 0,
      canvasHeight: 0,
      started: false,
    }

    this.togglePause = this.togglePause.bind(this)
    this.startGame = this.startGame.bind(this)
    this.changeDirection = this.changeDirection.bind(this)
  }

  componentDidMount() {
    const interval = setInterval(() => {
      if (!this.state.paused) {
        if (this.state.ship) {
          this.bounceShipOffWall()
          this.moveShip()
          this.setState(state => {
            let score = state.score + 1
            let trash = state.trash
            if (this.state.score % 1000 === 0) {
              trash = trash.concat(
                getTrashOnEachEdge(1, state.canvasWidth, state.canvasHeight)
              )
            }
            return {
              score: score,
              trash: trash,
            }
          })
        }

        // draw trash
        for (let tr of this.state.trash) {
          this.bounceObjectOffWall(tr)
          tr.x += tr.xGrow == null ? 0 : tr.xGrow ? tr.speed : -tr.speed
          tr.y += tr.yGrow == null ? 0 : tr.yGrow ? tr.speed : -tr.speed
          this.drawObject(tr)
          if (this.state.ship && this.hasCollision(tr, this.state.ship)) {
            this.gameOver()
          }
        }

        // draw space
        this.setState(state => {
          const ctx = state.ctx
          ctx.fillStyle = "rgba(0,0,0,0.5)" // 0.08
          ctx.fillRect(0, 0, this.state.canvasWidth, this.state.canvasHeight)
          return {
            ctx,
          }
        })
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
    const trash = getTrashOnEachEdge(6, canvas.width, canvas.height)
    this.setState({
      trash: trash,
    })
  }

  render() {
    return (
      <div style={{ height: "100%", width: "100%", backgroundColor: "black" }}>
        <canvas
          ref="canvas"
          style={{ height: "100%", width: "100%", backgroundColor: "black" }}
          tabIndex="-1"
          onKeyDown={e => this.changeDirection(e.keyCode, true)}
          onKeyUp={e => this.changeDirection(e.keyCode, false)}
        ></canvas>
        <ScoreBoard
          highScore={this.state.highScore}
          currScore={this.state.score}
          paused={this.state.paused}
          togglePause={this.togglePause}
        ></ScoreBoard>
        {(this.state.paused || !this.state.started) && (
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
      size: 6,
      color: "#FFFF00",
    }
    const cw = this.state.canvasWidth
    const ch = this.state.canvasHeight

    const a1 = buildTrash((3 * cw) / 4, rand(ch))
    const a2 = buildTrash((3 * cw) / 4, rand(ch))
    const a3 = buildTrash(cw / 2, rand(ch))
    const a4 = buildTrash(cw / 2, rand(ch))
    const a5 = buildTrash(cw, rand(ch))
    const newTrash = [a1, a2, a3, a4, a5]

    this.setState({
      ship: newShip,
      score: 1,
      paused: false,
      trash: newTrash,
      started: true,
    })
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

  changeDirection(keyCode, isKeyDown) {
    if (this.state.ship) {
      this.setState(state => {
        const ship = state.ship

        if (keyCode === 38) {
          // up arrow
          ship.yAccel = isKeyDown ? -0.08 : 0
        } else if (keyCode === 40) {
          // down arrow
          ship.yAccel = isKeyDown ? 0.08 : 0
        } else if (keyCode === 37) {
          // left arrow
          ship.xAccel = isKeyDown ? -0.08 : 0
        } else if (keyCode === 39) {
          // right arrow
          ship.xAccel = isKeyDown ? 0.08 : 0
        }
        return {
          ship,
        }
      })
    }
  }
}

function getTrashOnEachEdge(num, cw, ch) {
  let trash = []
  for (let i = 0; i < num; i++) {
    const aTop = buildTrash(rand(cw), 0)
    const aRight = buildTrash(0, rand(ch))
    const aDown = buildTrash(rand(cw), ch)
    const aLeft = buildTrash(cw, rand(ch))

    trash = trash.concat(aTop, aRight, aDown, aLeft)
  }
  return trash
}

function buildTrash(x, y) {
  const randSpeed = randomIntFromUniformDistribution(1, 10) * 0.1
  const randSize = randomIntFromUniformDistribution(5, 50)
  return {
    size: randSize,
    x: x,
    y: y,
    xGrow: false,
    yGrow: false,
    speed: randSpeed,
    color: getTrashColor(),
  }
}

function getTrashColor() {
  return `hsla(${randomIntFromUniformDistribution(113, 255)},100%,60%,1)`
}

function rand(mx) {
  return ~~(Math.random() * (mx - 0 + 1))
}

function randomIntFromUniformDistribution(mn, mx) {
  return ~~(Math.random() * (mx - mn + 1) + mn)
}
