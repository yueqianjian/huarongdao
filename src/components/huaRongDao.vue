<template>
  <div class="huarongdao" :style="`width:${canvasW}px`" @click="hideLevel">
    <div class="setter">
      <input v-model.number="row" />x<input v-model.number="col" />
      <p>输入最小为
        <span>3</span>，最大为
        <span>10</span> 的数值，修改后请
        <span>重置</span>！！！</p>
    </div>
    <div class="timer">
      <p ref="timer"></p>
    </div>
    <div class="main" :style="`width:${canvasW}px`">
      <canvas ref="canvas"></canvas>
      <template v-if="refresh">
        <div ref="cell" v-for="(item,index) in imgArr" :key="index" @click="move($event.target)" :style="`height: ${cellH}px;background-image: url('${ canvasURL }');background-position: -${item[0] * canvasW}px -${item[1]* canvasH}px;flex: 0 0 ${100/flexNum}%`"></div>
      </template>
    </div>
    <div class="menu">
      <div @click.stop="showLevel">
        <div>
          <p>难度</p>
          <p>{{levelList[level]}}</p>
        </div>
        <div v-if="levelFlag">
          <div v-for="(item,index) in levelList" :key="item" @click.stop="setLevel(index)">
            {{ item }}
          </div>
        </div>
      </div>
      <div @click="gameStart">
        开始
      </div>
      <div @click="reload">
        重置
      </div>
      <div>
        选择图片
        <input @change="changeImg" type="file" accept="image/*">
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      refresh: false,
      row: 4,
      col: 4,
      canvasW: 900,
      canvasH: 0,
      cellH: 0,
      imgArr: [],
      img: require("../assets/xiaoyaogu.jpg"),
      canvasURL: "",
      cell: null,
      flexNum: NaN,
      timerNum: NaN,
      time: 180000,
      level: 1,
      levelList: ["史莱姆", "村民", "魔王"],
      levelFlag: false
    };
  },
  watch: {
    row(e) {
      this.numFilter(e, "row");
    },
    col(e) {
      this.numFilter(e, "col");
    }
  },
  methods: {
    init() {
      this.refresh = false;
      this.flexNum = this.col;
      this.setImgArr();
      this.createImg(this.img, (w, h, img) => {
        this.writeCanvas(w, h, img);
      });
      this.setTime();
      this.$nextTick(() => {
        this.refresh = true;
      });
    },
    setImgArr() {
      const { row, col } = this;
      let arr = [];
      for (let i = 0; i < row; i++) {
        for (let j = 0; j < col; j++) {
          arr.push([j / col, i / row]);
        }
      }
      this.imgArr = arr;
    },
    createImg(src, callback) {
      let img = new Image();
      img.src = src;
      img.onload = () => {
        let w = img.naturalWidth;
        let h = img.naturalHeight;
        callback(w, h, img);
      };
    },
    writeCanvas(w, h, img) {
      let canvas = this.$refs.canvas;
      const { canvasW, row } = this;
      let canvasH = h * canvasW / w;
      this.cellH = canvasH / row;
      canvas.width = canvasW;
      canvas.height = canvasH;
      let ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, w, h, 0, 0, canvasW, canvasH);
      let url = canvas.toDataURL();
      this.canvasURL = url;
      this.canvasH = canvasH;
    },
    confuse() {
      const { row, col } = this;
      let cell = this.$refs.cell;
      let max = row * col;
      let arr = Array(max).fill(0);
      let num = Math.floor(Math.random() * max);
      for (let i = 0; i < max; i++) {
        while (true) {
          if (arr[num]) {
            num = Math.floor(Math.random() * max);
          } else {
            arr[num] = i;
            break;
          }
        }
      }
      for (let i = 0; i < max; i++) {
        cell[i].style.order = arr[i];
      }
      this.$nextTick(this.oneIsNone);
    },
    oneIsNone() {
      const { row, col } = this;
      let cell = this.$refs.cell;
      let max = row * col;
      let num = Math.floor(Math.random() * max);
      cell = cell[num];
      this.cell = cell;
      cell.style.background = "transparent";
    },
    canMove(o) {
      const { row, col } = this;
      const order = Number(this.cell.style.order);
      if (
        o - 1 === order ||
        o + 1 === order ||
        o + col === order ||
        o - col === order
      ) {
        if (order % col === 0 && o + 1 === order) {
          return false;
        } else if (order % col === col - 1 && o - 1 === order) {
          return false;
        } else {
          return true;
        }
      }
    },
    move(e) {
      const o = Number(e.style.order);
      const order = Number(this.cell.style.order);
      const bool = this.canMove(o);
      if (bool) {
        e.style.order = order;
        this.cell.style.order = o;
      }
      this.$nextTick(this.success);
    },
    success() {
      let cell = this.$refs.cell;
      let num = 0;
      for (let i in cell) {
        if (cell[i].style.order === i) {
          num++;
        }
      }
      if (num === cell.length) {
        clearInterval(this.timerNum);
        setTimeout(() => {
          alert("恭喜通关！");
        }, 200);
      }
    },
    numFilter(e, name) {
      if (typeof e !== "number") {
        this[name] = 4;
        return;
      }
      if (e < 3) {
        this[name] = 3;
      } else if (e > 10) {
        this[name] = 10;
      }
    },
    gameStart() {
      this.confuse();
      this.timer();
    },
    reload() {
      this.init();
      clearInterval(this.timerNum);
      this.$refs.timer.style.width = `100%`;
    },
    changeImg(e) {
      const file = e.target.files[0];
      const url = window.URL.createObjectURL(file);
      this.img = url;
      this.reload();
    },
    setTime() {
      const { row, col, level } = this;
      const r = row - 3;
      const c = col - 3;
      let num = 1;
      switch (level) {
        case 0:
          num = 1;
          break;
        case 1:
          num = 1.2;
          break;
        case 2:
          num = 1.5;
          break;
      }
      const time = ((r + c) * 60000 + 150000) * num;
      this.time = time;
    },
    timer() {
      clearInterval(this.timerNum);
      const { time } = this;
      let time2 = time;
      this.timerNum = setInterval(() => {
        time2 = time2 - 1000;
        this.$refs.timer.style.width = `${time2 * 100 / time}%`;
        if (time2 <= 0) {
          clearInterval(this.timerNum);
          setTimeout(() => {
            alert("GAME OVER");
          }, 200);
        }
      }, 1000);
    },
    showLevel() {
      this.levelFlag = true;
    },
    hideLevel() {
      this.levelFlag = false;
    },
    setLevel(i) {
      this.level = i;
      this.hideLevel();
      this.reload();
    }
  },
  mounted() {
    this.init();
  }
};
</script>

<style scoped lang="scss">
.huarongdao {
  margin: 5vh auto 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  > * {
    margin-top: 30px;
    margin-bottom: 0;
  }
  .setter {
    font-size: 30px;
    > input {
      font-size: 30px;
      width: 70px;
      text-align: center;
      margin: 0 7px;
    }
    > p {
      margin-top: 5px;
      font-size: 14px;
      > span {
        color: #ff0000;
      }
    }
  }
  .timer {
    width: 100%;
    height: 20px;
    line-height: 20px;
    background: #fff;
    border: 1px solid #000;
    > p {
      width: 100%;
      background: #000;
      height: 18px;
    }
  }
  .main {
    display: flex;
    flex-flow: row wrap;
    align-content: flex-start;
    position: relative;
    > canvas {
      position: absolute;
      left: 0;
      top: 0;
      opacity: 0.2;
      z-index: -1;
    }
    > div {
      background-repeat: no-repeat;
    }
  }
  .menu {
    display: flex;
    justify-content: center;
    color: #0298fb;
    > div {
      height: 50px;
      line-height: 50px;
      background: #ffffff;
      cursor: pointer;
      width: 80px;
      border: 1px solid #000000;
      margin: 0 10px;
      &:first-child {
        position: relative;
        > div {
          &:first-child {
            padding: 5px;
            > p {
              height: 20px;
              line-height: 20px;
              &:first-child {
                border-bottom: 1px solid #777777;
              }
            }
          }
          &:nth-child(2) {
            position: absolute;
            left: -1px;
            bottom: 49px;
            width: 80px;
            > div {
              height: 40px;
              line-height: 40px;
              border: 1px solid #000000;
              border-bottom: none;
              background: #ffffff;
            }
          }
        }
      }
      &:last-child {
        position: relative;
        overflow: hidden;
        > input {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          cursor: pointer;
        }
      }
    }
  }
}
</style>
