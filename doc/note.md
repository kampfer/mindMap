关于架构设计
============

设计一个领域实体，必须明确这个领域实体必须知道其他哪些领域实体（帮助其完成业务），之后对于其他领域实体可以完全无视。

程序的启动程序的主要工作是：初始化view、model和controller。model比较封闭，初始化时一般不需要外部帮助；view初始化一般需要model数据等信息；controller需要view和model的引用，保证view和model信息的同步。

数据的流动方向和路径？


已经使用的设计模式
==================

1. Observer
2. Composition
3. Command
4. Template Method


**Composition模式**
类有两部分的功能: 管理子节点和递归操作