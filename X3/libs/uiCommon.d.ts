import * as fairygui from "fairygui-cc";

declare global {
    namespace fgui {
        class GGroup extends fairygui.GGroup{}
        class GObject extends fairygui.GObject { }
        class GGraph extends fairygui.GGraph { }
        class GImage extends fairygui.GImage { }
        class GMovieClip extends fairygui.GMovieClip { }
        class GRoot extends fairygui.GRoot { }
        class GTextField extends fairygui.GTextField { }
        class GRichTextField extends fairygui.GRichTextField { }
        class GTextInput extends fairygui.GTextInput { }
        class GLoader extends fairygui.GLoader { }
        class GLoader3D extends fairygui.GLoader3D { }
        class GComponent extends fairygui.GComponent { }
        class GLabel extends fairygui.GLabel { }
        class GButton extends fairygui.GButton { }
        class GComboBox extends fairygui.GComboBox { }
        class GSlider extends fairygui.GSlider { }
        class GProgressBar extends fairygui.GProgressBar { }
        class GScrollBar extends fairygui.GScrollBar { }
        class GList extends fairygui.GList { }
        class GTree extends fairygui.GTree { }
        class GTreeNode extends fairygui.GTreeNode { }
        class Window extends fairygui.Window { }
        class PopupMenu extends fairygui.PopupMenu { }
        class Controller extends fairygui.Controller { }
        class Transition extends fairygui.Transition { }
        class ScrollPane extends fairygui.ScrollPane { }
        class UIPackage extends fairygui.UIPackage { }
        class PackageItem extends fairygui.PackageItem { }
        class GObjectPool extends fairygui.GObjectPool { }
        class UIObjectFactory extends fairygui.UIObjectFactory { }
        class DragDropManager extends fairygui.DragDropManager { }
        class AsyncOperation extends fairygui.AsyncOperation { }
        class TranslationHelper extends fairygui.TranslationHelper { }
        class GearAnimation extends fairygui.GearAnimation { }
        class GearBase extends fairygui.GearBase { }
        class GearColor extends fairygui.GearColor { }
        class GearDisplay extends fairygui.GearDisplay { }
        class GearDisplay2 extends fairygui.GearDisplay2 { }
        class GearFontSize extends fairygui.GearFontSize { }
        class GearIcon extends fairygui.GearIcon { }
        class GearLook extends fairygui.GearLook { }
        class GearSize extends fairygui.GearSize { }
        class GearText extends fairygui.GearText { }
        class GearXY extends fairygui.GearXY { }
        class Image extends fairygui.Image { }
        class MovieClip extends fairygui.MovieClip { }
        class Event extends fairygui.Event { }
        class GTween extends fairygui.GTween { }
        class GTweener extends fairygui.GTweener { }
        class UBBParser extends fairygui.UBBParser { }
        class ByteBuffer extends fairygui.ByteBuffer { }
    }
}