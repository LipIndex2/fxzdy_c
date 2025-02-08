import { sp, __private } from "cc";
import { JSB } from "cc/env"

if (!JSB) {
    window["TrackEntryListeners"]["removeAddListener"] = function (listener_ID: number) {
        window["TrackEntryListeners"]._listenerSet.delete(listener_ID);
    }

    window["SpineSkeletonPrototypeExtension_listenerIds"] = {}
    window["SpineSkeletonPrototypeExtension_pushListenerIds"] = function (uuid: string, listenerId: number): void {
        let obj = window["SpineSkeletonPrototypeExtension_listenerIds"]
        if (!obj[uuid]) {
            obj[uuid] = []
        }
        obj[uuid].push(listenerId)
    }

    sp.Skeleton.prototype["removeAllAddListener"] = function () {

        let obj = window["SpineSkeletonPrototypeExtension_listenerIds"]
        let listenerIds: number[] = obj[this.uuid];
        if (listenerIds) {
            for (let i = 0; i < listenerIds.length; i++) {
                window["TrackEntryListeners"]["removeAddListener"](listenerIds[i])
            }
        }
        delete obj[this.uuid];
    }

    sp.Skeleton.prototype.setCompleteListener = function (listener: any) {
        this._ensureListener();
        const listenerID = window["TrackEntryListeners"].addListener(listener);
        this._instance!.setListener(listenerID, sp.spine.EventType.complete);
        this._listener!.complete = listener;
        window["SpineSkeletonPrototypeExtension_pushListenerIds"](this.uuid, listenerID)

    }

    sp.Skeleton.prototype.setEventListener = function (listener: any) {
        this._ensureListener();
        const listenerID = window["TrackEntryListeners"].addListener(listener);
        this._instance!.setListener(listenerID, sp.spine.EventType.event);
        this._listener!.event = listener;
        window["SpineSkeletonPrototypeExtension_pushListenerIds"](this.uuid, listenerID)

    }

    sp.Skeleton.prototype.setStartListener = function (listener: any): void {
        this._ensureListener();
        const listenerID = window["TrackEntryListeners"].addListener(listener);
        this._instance!.setListener(listenerID, sp.spine.EventType.start);
        this._listener!.start = listener;
        window["SpineSkeletonPrototypeExtension_pushListenerIds"](this.uuid, listenerID)

    }

    sp.Skeleton.prototype.setInterruptListener = function (listener: any): void {
        this._ensureListener();
        const listenerID = window["TrackEntryListeners"].addListener(listener);
        this._instance!.setListener(listenerID, sp.spine.EventType.interrupt);
        this._listener!.interrupt = listener;
        window["SpineSkeletonPrototypeExtension_pushListenerIds"](this.uuid, listenerID)

    }

    sp.Skeleton.prototype.setEndListener = function (listener: any): void {
        this._ensureListener();
        const listenerID = window["TrackEntryListeners"].addListener(listener);
        this._instance!.setListener(listenerID, sp.spine.EventType.end);
        this._listener!.end = listener;
        window["SpineSkeletonPrototypeExtension_pushListenerIds"](this.uuid, listenerID)

    }

    sp.Skeleton.prototype.setDisposeListener = function (listener: any): void {
        this._ensureListener();
        const listenerID = window["TrackEntryListeners"].addListener(listener);
        this._instance!.setListener(listenerID, sp.spine.EventType.dispose);
        this._listener!.dispose = listener;
        window["SpineSkeletonPrototypeExtension_pushListenerIds"](this.uuid, listenerID)
    }
}