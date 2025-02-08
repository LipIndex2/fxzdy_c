import GrowableStack from "./GrowableStack";

class LinkNode{
    public prev:LinkNode;
    public next:LinkNode;
    public data:any;

    public clear():void{
        this.prev = null;
        this.next = null;
        this.data = null;
    }
}

/**
 * 为了解决数组频繁删除和插入带来的性能消耗，使用链表的方式实现数组
 */
export class LinkTableArray{
    private cacheNode:GrowableStack;
    /**根节点 */
    private head:LinkNode;
    /**最后的一个元素 */
    private last:LinkNode;
    /**length */
    private m_count:number = 0
    constructor() {
        this.cacheNode = new GrowableStack(20);
    }
    public push(element:any):void{
        var node:LinkNode = this.createNode();
        node.data = element;
        if(this.head == null){
            this.head = node;
            this.last = node;
        }else{
            this.last.next = node;
            node.prev = this.last;
            this.last = node;
        }
        ++this.m_count;
    }

    public shift(){
        if(this.head){
            let head = this.head.data;
            this.removeByNode(this.head);
            return head;
        }
        return null;
    }

    public pop(){
        if(this.last){
            let last = this.last.data;
            this.removeByNode(this.last);
            return last;
        }
        return null;
    }

    public getLast():any{
        return this.last;
    }

    public clear():void{
        var node = this.head;
        while (node){
            var tmp = node.next;
            node.clear();
            node = tmp;
        }
    }

    private removeByNode(node){
        if(node  === this.head){
            this.head = node.next;
        }

        if(node === this.last){
            this.last = node.prev;
        }

        if(node.prev){
            node.prev.next = node.next;
        }

        if(node.next){
            node.next.prev = node.prev;
        }
        node.clear();
        --this.m_count;
        if(this.cacheNode.getCount() < 20){
            this.cacheNode.push(node);
        }
    }

    /**长度 */
    public get count():number{
        return this.m_count;
    }

    public toArray() {
        let result = [];
        let node = this.head;
        while (node){
            result.push(node.data)
            node = this.head.next;
        }
        return result;
    }

    private createNode():LinkNode{
        var node = this.cacheNode.pop();
        if(!node){
            node = new LinkNode()
        }
        return node;
    }
}