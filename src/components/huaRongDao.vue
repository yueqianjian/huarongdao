<template>
  <div class="huarongdao" :style="`width:${canvasW}px`">
    <p class="setter">
      <input v-model="row" />x<input v-model="col" />
    </p>
    <div class="timer">
      <p></p>
    </div>
    <div class="main" :style="`width:${canvasW}px`">
      <canvas ref="canvas"></canvas>
      <template v-if="refresh">
        <div ref="cell" v-for="(item,index) in imgArr" :key="index" @click="move($event.target)" :style="`height: ${cellH}px;background-image: url('${ canvasURL }');background-position: -${item[0] * canvasW}px -${item[1]* canvasH}px;flex: 0 0 ${100/flexNum}%`"></div>
      </template>
    </div>
    <div class="menu">
      <div>
        难度
      </div>
      <div>
        开始
      </div>
      <div @click="init">
        重载
      </div>
      <div>
        选择图片
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
      flexNum: NaN
    };
  },
  methods: {
    init() {
      this.refresh = false;
      this.flexNum = this.col;
      this.setImgArr();
      this.createImg(this.img, (w, h, img) => {
        this.writeCanvas(w, h, img);
      });
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
      this.confuse();
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
        alert("恭喜通关！");
      }
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
  }
  .timer {
    width: 100%;
    height: 20px;
    line-height: 20px;
    background: #fff;
    border: 1px solid #000;
    > p {
      width: 50%;
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
      // flex: 0 0 25%;
      background-repeat: no-repeat;
    }
  }
  .menu {
    display: flex;
    justify-content: center;
    > div {
      height: 50px;
      line-height: 50px;
      cursor: pointer;
      width: 80px;
      border: 1px solid #000000;
      margin: 0 10px;
    }
  }
}
</style>
