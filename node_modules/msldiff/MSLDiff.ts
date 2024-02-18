// Mappy String Line Diff - blobbybilb 2024 - MIT License
abstract class MSLDiff {
  static lineSeparator = "\n"

  static diff(a: string, b: string): (string | number)[] {
    const x = new Map<string, number>(
      a.split(this.lineSeparator).map((e, i) => [e, i])
    )
    const r: (string | number)[] = []

    for (let l of b.split(this.lineSeparator)) {
      if (x.has(l)) r.push(x.get(l)!)
      else r.push(l)
    }

    return r
  }

  static edit(a: string, d: (string | number)[]): string {
    const x = new Map<number, string>(a.split(this.lineSeparator).entries())
    return d.map((e) => (typeof e === "number" ? x.get(e)! : e)).join("\n")
  }
}

export { MSLDiff }
