import{c as s,C as o,a as l,t as e}from"./scene-DoIlONrW.js";const a=s({title:"AI 对话",sessionId:"demo-pdf-deepread",namespaces:o,sourcePane:!0,replies:[{keywords:["参数服务器","allreduce","聚合"],reply:e(`**参数服务器**：worker 将梯度发送给参数服务器，由服务器完成聚合与参数更新，再向 worker 分发更新后的参数。[PDF@file_demo_mlsys:45]

**AllReduce**：参与节点通过集合通信共同完成梯度归约，各节点获得相同的聚合结果，再更新各自的模型副本。

两种方式都服务于数据并行训练。选择时可以结合网络拓扑、节点规模与故障处理需求，比较通信负载和运行效率。`)},{keywords:["同步","慢","straggler","等待"],reply:e(`同步 SGD 每一步都要等所有 worker 交回梯度，所以**每轮用时由最慢的节点决定**。[PDF@file_demo_mlsys:47]

可以这样估算：单步时间 ≈ max(各 worker 计算时间) + 梯度通信时间。worker 越多，出现慢节点的概率越大，加速比就越偏离线性。

缓解思路包括异步或有界延迟更新、备份 worker，以及第 52 页提到的减少通信量的方法。[PDF@file_demo_mlsys:52]`)},{keywords:["压缩","量化","稀疏","通信"],reply:e(`梯度压缩的出发点是：数据并行训练里，每一步都要传输与模型同样大小的梯度，网络带宽很容易成为瓶颈。[PDF@file_demo_mlsys:52]

- **量化**：把 32 位浮点梯度编码成更少的比特；
- **稀疏化**：只传绝对值最大的一部分梯度，其余累积到下一轮。

评估时要同时记录通信耗时、吞吐量和收敛情况——传得少了，但如果需要更多步才能收敛，总训练时间未必更短。`)}],fallback:e(`这段演示里的回答来自预设学习材料：你可以点正文里的 PDF 页码徽章、缩放章节导图、翻转下方的挖空卡，也可以换一个问题，比如「同步 SGD 为什么会被慢节点拖住？」

在 Deep Student 桌面版里连上自己选的模型后，就能带着自己的教材、照片和笔记继续提问。`),arrange(r){l(r)}});export{a as default};
