import { MSLDiff } from "msldiff"

class VersionCheckpoint {
  readonly initial: string
  readonly edits: (string | number)[][]
  cache?: string

  constructor(initial: string, edits: (string | number)[][] = []) {
    this.initial = initial
    this.edits = edits
  }

  get(v: number): string {
    let r = this.initial
    for (let i = 0; i < v; i++) {
      r = MSLDiff.edit(r, this.edits[i])
    }
    return r
  }

  get count() {
    return this.edits.length
  }

  get current(): string {
    return this.cache ?? this.get(this.count)
  }

  set current(v: string) {
    this.edits.push(MSLDiff.diff(this.current, v))
    this.cache = v
  }

  updateCurrent(v: string) {
    this.edits.pop()
    this.current = v
  }

  get hash(): string {
    const editLengths = this.edits.map((edit) => edit.length).join("-")
    return `${this.initial.length}_${editLengths}|${this.current}`
  }
}

abstract class VersionStringConfig {
  static updateDecider?: (a: string, b: string) => boolean = (a, b) => {
    const diff = MSLDiff.diff(a, b)
    const linesChanged: number[] = []

    if (a.split("\n").length !== b.split("\n").length) return false

    diff.forEach((e, i) => {
      if (typeof e === "string") linesChanged.push(i)
    })

    console.log(4, diff)
    console.log(5, linesChanged)

    return linesChanged.length < 2
  }
}

class VersionedString {
  checkpoints: VersionCheckpoint[]

  constructor(data: VersionCheckpoint[] | string) {
    if (typeof data === "string") {
      this.checkpoints = [new VersionCheckpoint(data)]
      return
    }

    this.checkpoints = data
  }

  get lastCheckpoint(): VersionCheckpoint {
    return this.checkpoints[this.checkpoints.length - 1]
  }

  get current(): string {
    return this.lastCheckpoint.current
  }

  set current(v: string) {
    if (this.current === v) return

    if (
      VersionStringConfig.updateDecider &&
      VersionStringConfig.updateDecider(this.current, v)
    ) {
      this.lastCheckpoint.updateCurrent(v)
      return
    }

    if (v.length < 100 || !v.includes("\n") || this.checkpoints.length > 10) {
      this.checkpoints.push(new VersionCheckpoint(v))
    } else {
      this.lastCheckpoint.current = v
    }
  }

  versions() {
    function* versionGenerator() {
      for (let i = 0; i < this.checkpoints.length; i++) {
        for (let j = 0; j < this.checkpoints[i].count; j++) {
          yield this.checkpoints[i].get(j)
        }
      }
    }
    return versionGenerator
  }
}

// test
const v = new VersionedString("hello")
v.current = `
hello
world
!!`
v.current = `
123
456
789
`
v.current = `
123
123
123
456
456
456
789
789
789
kjsrhf873u4ihjhgfehjkagsfjgfjhegfkhakjdfgjdgsfjhgdjfdkjgjhdgshdskfgj
sdfgljjdgfhjgfkjsfdgkhjsgdf
`

console.log(v.checkpoints)

for (const version of v.versions()) {
  console.log(version)
}

export { VersionedString, VersionStringConfig }
