local plain = SILE.require("classes/plain")
local quran = plain { id = "quran", base = plain }
if not(SILE.scratch.headers) then SILE.scratch.headers = {}; end
SILE.settings.declare({name = "font.family", type = "string", default = "Amiri"})
SILE.scratch.counters.folio = { value = 1, display = "arab" }

function quran:masters()
  self:defineMaster({ id = "right", firstContentFrame = "content", frames = {
    content = {left = "8.3%pw", right = "86%pw", top = "11.6%ph", bottom = "83.3%ph", direction = "RTL-TTB" },
    folio = {left = "left(content)", right = "right(content)", top = "bottom(content)+3%ph", bottom = "bottom(content)+5%ph", direction = "RTL-TTB" },
    runningHead = {left = "left(content)", right = "right(content)", top = "top(content) - 8%ph", bottom = "top(content)-3%ph" },
  }})
  self:defineMaster({ id = "left", firstContentFrame = "content", frames = {
    content = {left = "14%pw", right = "91.7%pw", top = "11.6%ph", bottom = "83.3%ph", direction = "RTL-TTB" },
    folio = {left = "left(content)", right = "right(content)", top = "bottom(content)+3%ph", bottom = "bottom(content)+5%ph", direction = "RTL-TTB" },
    runningHead = {left = "left(content)", right = "right(content)", top = "top(content) - 8%ph", bottom = "top(content)-3%ph" },
  }})
end

function quran:init()
  self:loadPackage("masters")
  self:loadPackage("infonode")
  self:loadPackage("chapterverse")
  SILE.registerCommand("format-reference", function (o,c)
    SILE.typesetter:typeset("S"..c.chapter.."A"..c.verse)
  end)

  self:masters()
  self:loadPackage("twoside", { oddPageMaster = "right", evenPageMaster = "left" })
  self.pageTemplate = SILE.scratch.masters["right"]
  SILE.settings.set("document.parindent", SILE.nodefactory.zeroGlue)
  local p = plain.init(self)
  return p
end

quran.newPage = function(self)
  self:switchPage()
  self:newPageInfo()
  return plain.newPage(self)
end

quran.finish = function (self)
  local r = plain.finish(self)
  --quran:writeToc()
  return r
end

quran.endPage = function(self)
  SILE.call("frame-rule")

  if (self:oddPage() and SILE.scratch.headers.right) then
    SILE.typesetNaturally(SILE.getFrame("runningHead"), function()
      SILE.settings.set("current.parindent", SILE.nodefactory.zeroGlue)
      SILE.settings.set("document.lskip", SILE.nodefactory.zeroGlue)
      SILE.settings.set("document.rskip", SILE.nodefactory.zeroGlue)
      -- SILE.settings.set("typesetter.parfillskip", SILE.nodefactory.zeroGlue)
      SILE.process(SILE.scratch.headers.right)
      SILE.call("par")
    end)
  elseif (not(self:oddPage()) and SILE.scratch.headers.left) then
    SILE.typesetNaturally(SILE.getFrame("runningHead"), function()
      SILE.settings.set("current.parindent", SILE.nodefactory.zeroGlue)
      SILE.settings.set("document.lskip", SILE.nodefactory.zeroGlue)
      SILE.settings.set("document.rskip", SILE.nodefactory.zeroGlue)
      -- SILE.settings.set("typesetter.parfillskip", SILE.nodefactory.zeroGlue)
      SILE.process(SILE.scratch.headers.left)
      SILE.call("par")
    end)
  end
  return plain.endPage(self)
end

local pdf = require("justenoughlibtexpdf")

SILE.registerCommand("frame-rule", function(options, content)
  local width = 0.8
  local offset = 10
  local f = SILE.getFrame("content")
  pdf.colorpush(0.8,0,0)
  SILE.outputters.libtexpdf.rule(f:left()-offset, f:top()-offset, f:width()+2*offset, width)
  SILE.outputters.libtexpdf.rule(f:left()-offset, f:top()-offset, width, f:height()+2*offset)
  SILE.outputters.libtexpdf.rule(f:right()+offset, f:top()-offset, width, f:height()+2*offset)
  SILE.outputters.libtexpdf.rule(f:left()-offset, f:bottom()+offset, f:width()+2*offset, width)
  pdf.colorpop()
end)

SILE.registerCommand("left-running-head", function(options, content)
  local closure = SILE.settings.wrap()
  SILE.scratch.headers.left = function () closure(content) end
end, "Text to appear on the top of the left page")

SILE.registerCommand("right-running-head", function(options, content)
  local closure = SILE.settings.wrap()
  SILE.scratch.headers.right = function () closure(content) end
end, "Text to appear on the top of the right page")


SILE.registerCommand("sura", function (o,c)
  local ch = o.index:match("%d+")
  io.write("<S"..ch.."> ")
  SILE.call("format-sura-name", o, {o.name})
  SILE.call("format-sura-place", o, {o.place})
  SILE.call("save-chapter-number", o, {o.index})
  SILE.process(c)
  SILE.call("par")
  if ch == "1" then
    SILE.typesetter:leaveHmode()
    SILE.call("supereject")
    SILE.typesetter:leaveHmode()
  end
end)

SILE.registerCommand("aya", function (o,c)
  if o.bismillah then
    SILE.call("bismillah", {}, {o.bismillah})
  end
  SILE.call("save-verse-number", o, {o.index})
  SILE.call("left-running-head", {}, function ()
    SILE.settings.temporarily(function()
      SILE.settings.set("document.lskip", SILE.nodefactory.zeroGlue)
      SILE.settings.set("document.rskip", SILE.nodefactory.zeroGlue)
      SILE.call("font", {size="10pt", family="Amiri"}, function ()
        SILE.call("first-reference")
        SILE.typesetter:typeset("-")
        SILE.call("last-reference")
        SILE.call("hfill")
      end)
      SILE.typesetter:leaveHmode()
    end)
  end)
  SILE.call("right-running-head", {}, function ()
    SILE.settings.temporarily(function()
      SILE.settings.set("document.lskip", SILE.nodefactory.zeroGlue)
      SILE.settings.set("document.rskip", SILE.nodefactory.zeroGlue)
      SILE.settings.set("typesetter.parfillskip", SILE.nodefactory.zeroGlue)
      SILE.call("font", {size="10pt", family="Amiri"}, function ()
        -- SILE.call("font", {style="italic"}, SILE.scratch.theChapter)
        SILE.call("hfill")
        SILE.call("first-reference")
        SILE.typesetter:typeset("-")
        SILE.call("last-reference")
      end)
      SILE.typesetter:leaveHmode()
    end)
  end)
  SILE.typesetter:typeset(o.text.." ")
end)

return quran
