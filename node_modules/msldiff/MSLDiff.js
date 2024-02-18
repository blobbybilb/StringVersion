// MSLDiff.ts
class MSLDiff {
  static lineSeparator = "\n"
  static diff(a, b) {
    const x = new Map(a.split(this.lineSeparator).map((e, i) => [e, i]))
    const r = []
    for (let l of b.split(this.lineSeparator)) {
      if (x.has(l)) r.push(x.get(l))
      else r.push(l)
    }
    return r
  }
  static edit(a, d) {
    const x = new Map(a.split(this.lineSeparator).entries())
    return d.map((e) => (typeof e === "number" ? x.get(e) : e)).join("\n")
  }
}
export { MSLDiff }
