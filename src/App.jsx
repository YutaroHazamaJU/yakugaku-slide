import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, BookOpen, Pill, Activity, TestTube, ArrowRight, Brain, AlertTriangle } from 'lucide-react';

// --- 計算ロジック ---
const calculateIonization = (ph, pka, type) => {
const diff = ph - pka;
let percentIonized;
if (type === 'acid') {
percentIonized = 100 / (1 + Math.pow(10, -diff));
} else {
percentIonized = 100 / (1 + Math.pow(10, diff));
}
return percentIonized;
};

// --- 部品（コンポーネント） ---
// 文字サイズを少し大きめに調整 (text-xl)
const Slide = ({ children, className = "" }) => (

<div className={"flex flex-col h-full p-8 md:p-12 overflow-y-auto text-xl " + className}>
{children}
</div>
);

const SectionTitle = ({ children }) => (

<h2 className="text-3xl md:text-4xl font-bold text-blue-800 mb-8 border-b-4 border-blue-200 pb-2">
{children}
</h2>
);

const BulletPoint = ({ children, icon: Icon = ChevronRight }) => (

<li className="flex items-start mb-6 text-gray-800 text-xl md:text-2xl">
<Icon className="w-8 h-8 mr-4 text-blue-500 flex-shrink-0 mt-1" />
<span>{children}</span>
</li>
);

// インタラクティブ実験：pHシミュレーター
const PhSimulator = () => {
const [ph, setPh] = useState(4);
const [drugType, setDrugType] = useState('acid'); // 'acid' or 'base'
const pKa = 4.5;

const ionization = calculateIonization(ph, pKa, drugType);
const unionized = 100 - ionization;

return (
<div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-gray-200 mt-4">
<h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
<TestTube className="mr-3 w-8 h-8" />
インタラクティブ実験：pHと薬物の運命
</h3>

  <div className="flex justify-center space-x-6 mb-8">
    <button 
      onClick={() => setDrugType('acid')}
      className={"px-6 py-3 rounded-full font-bold text-lg " + (drugType === 'acid' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600')}
    >
      弱酸性薬物 (例: NSAIDs, pKa 4.5)
    </button>
    <button 
      onClick={() => setDrugType('base')}
      className={"px-6 py-3 rounded-full font-bold text-lg " + (drugType === 'base' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600')}
    >
      弱塩基性薬物 (例: 麻酔薬, pKa 8.0)
    </button>
  </div>

  <div className="mb-8">
    <label className="block text-gray-700 font-bold mb-2 text-xl">
      環境pH: <span className="text-4xl text-blue-600 mx-2">{ph}</span> 
      <span className="text-lg font-normal ml-2 text-gray-500">
        ({ph < 3 ? '胃内' : ph < 6 ? '十二指腸' : ph < 7.5 ? '小腸・血液' : '大腸・塩基性環境'})
      </span>
    </label>
    <input 
      type="range" 
      min="1" 
      max="10" 
      step="0.1" 
      value={ph}
      onChange={(e) => setPh(parseFloat(e.target.value))}
      className="w-full h-4 bg-gray-200 rounded-lg appearance-none cursor-pointer"
    />
    <div className="flex justify-between text-sm text-gray-400 mt-2">
      <span>pH 1 (酸性)</span>
      <span>pH 10 (塩基性)</span>
    </div>
  </div>

  <div className="grid grid-cols-2 gap-8">
    <div className="bg-blue-50 p-6 rounded-lg text-center border border-blue-100">
      <div className="text-lg text-gray-600 mb-2">水への溶解性 (イオン形)</div>
      <div className="text-5xl font-bold text-blue-600 mb-4">{ionization.toFixed(1)}%</div>
      <div className="h-32 flex items-end justify-center space-x-1">
         <div className="w-full bg-blue-200 rounded-b-md relative overflow-hidden" style={{height: '100%'}}>
            <div 
              className="absolute bottom-0 left-0 w-full bg-blue-500 transition-all duration-300"
              style={{ height: String(ionization) + "%", opacity: 0.7 }}
            ></div>
            <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-blue-900 z-10">
              {ionization > 50 ? 'よく溶ける' : '析出のリスク'}
            </span>
         </div>
      </div>
    </div>

    <div className="bg-orange-50 p-6 rounded-lg text-center border border-orange-100">
      <div className="text-lg text-gray-600 mb-2">膜透過性 (分子形)</div>
      <div className="text-5xl font-bold text-orange-600 mb-4">{unionized.toFixed(1)}%</div>
      <div className="h-32 flex items-end justify-center">
         <div className="w-full bg-orange-200 rounded-b-md relative overflow-hidden" style={{height: '100%'}}>
            <div 
              className="absolute bottom-0 left-0 w-full bg-orange-500 transition-all duration-300"
              style={{ height: String(unionized) + "%", opacity: 0.7 }}
            ></div>
            <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-orange-900 z-10">
              {unionized > 50 ? '吸収されやすい' : '吸収されにくい'}
            </span>
         </div>
      </div>
    </div>
  </div>
  
  <div className="mt-6 text-base text-gray-600 bg-gray-100 p-4 rounded border-l-4 border-gray-500">
    <strong>解説:</strong> {drugType === 'acid' ? '弱酸性' : '弱塩基性'}薬物は、
    pHが{drugType === 'acid' ? '高い' : '低い'}ほどイオン化して溶けやすくなりますが、
    膜透過性（吸収）は低下します。この<span className="font-bold text-red-500">「溶解と透過のジレンマ」</span>をどう解決するかが製剤学の鍵です。
  </div>
</div>


);
};

// --- メインアプリ ---
const App = () => {
const [currentSlide, setCurrentSlide] = useState(0);

const slides = [
{
content: (
<Slide className="flex flex-col justify-center items-center text-center bg-gradient-to-br from-blue-50 to-white">
<div className="max-w-4xl">
<h1 className="text-5xl md:text-7xl font-bold text-gray-800 mb-8 leading-tight">
酸塩基平衡と



溶解現象の重要性
</h1>
<p className="text-2xl md:text-3xl text-gray-600 mb-12">
物理化学の基礎から




<span className="font-bold text-blue-600">生物薬剤学</span>・<span className="font-bold text-indigo-600">製剤学</span>の実践へ
</p>
<div className="flex justify-center space-x-8">
<div className="flex items-center text-xl text-gray-500">
<Brain className="w-8 h-8 mr-2" /> 基礎理論
</div>
<ArrowRight className="text-gray-300 w-8 h-8" />
<div className="flex items-center text-xl text-gray-500">
<Pill className="w-8 h-8 mr-2" /> 医薬品開発
</div>
</div>
<div className="mt-16 text-gray-400 text-lg animate-bounce">
Start Presentation
</div>
</div>
</Slide>
)
},
{
title: "なぜ「酸塩基平衡」を学ぶのか？",
content: (
<Slide>
<SectionTitle>薬学における永遠のジレンマ</SectionTitle>
<div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center h-full">
<div>
<p className="text-2xl text-gray-600 mb-8 leading-relaxed">
多くの医薬品は「弱酸」または「弱塩基」の有機化合物です。
これらは環境のpHによって、その姿（存在状態）を劇的に変えます。
</p>
<ul className="space-y-6">
<BulletPoint icon={AlertTriangle}>
<strong>イオン形 (Ionized):</strong> 




水によく溶けるが、脂質の膜（細胞膜）を通れない。
</BulletPoint>
<BulletPoint icon={AlertTriangle}>
<strong>分子形 (Unionized):</strong> 




膜は通れるが、水に溶けにくい。
</BulletPoint>
</ul>
<div className="mt-10 p-6 bg-red-50 text-red-800 rounded-xl border-l-8 border-red-500 text-xl">
<span className="font-bold">重要:</span> 薬が効くためには「溶けて」かつ「吸収される」必要があります。
このバランスを支配するのが <span className="font-bold text-2xl">pH</span> と <span className="font-bold text-2xl">pKa</span> です。
</div>
</div>
<div className="flex justify-center items-center">
<div className="relative w-80 h-80 bg-gray-100 rounded-full flex items-center justify-center border-4 border-dashed border-gray-300">
<div className="absolute top-0 text-center w-full mt-10">
<div className="font-bold text-2xl text-blue-600">水相 (消化管液)</div>
<div className="text-base">親水性・イオン形</div>
</div>
<div className="w-full h-1 bg-gray-400 absolute"></div>
<div className="absolute bottom-0 text-center w-full mb-10">
<div className="font-bold text-2xl text-orange-600">生体膜 (脂質)</div>
<div className="text-base">疎水性・分子形</div>
</div>
<div className="z-10 bg-white p-4 rounded shadow-lg text-lg font-bold">
Henderson-Hasselbalch式



が支配する世界
</div>
</div>
</div>
</div>
</Slide>
)
},
{
title: "【実験】pH変化と薬物の挙動",
content: (
<Slide>
<SectionTitle>Henderson-Hasselbalch式の可視化</SectionTitle>
<p className="text-gray-600 mb-4 text-xl">
下のスライダーでpHを動かし、薬物がどう変化するか確認しましょう。
</p>
<PhSimulator />
</Slide>
)
},
{
title: "生物薬剤学への応用：吸収",
content: (
<Slide>
<SectionTitle>pH分配仮説と吸収部位</SectionTitle>
<div className="flex flex-col space-y-8">
<div className="bg-white p-8 rounded-xl shadow-sm border-l-8 border-green-500">
<h3 className="font-bold text-2xl text-green-700 mb-4 flex items-center">
<Activity className="mr-3 w-8 h-8" /> 体内でのドラマ
</h3>
<p className="text-xl text-gray-700">
薬物は消化管内を移動しながら、刻々と変化するpH環境にさらされます。
</p>
</div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border-2 p-6 rounded-xl">
            <h4 className="font-bold text-2xl text-gray-800 border-b-2 pb-3 mb-4">胃 (pH 1.2〜2.0)</h4>
            <ul className="text-lg space-y-3">
              <li className="text-blue-600">● 弱酸性薬物</li>
              <li>→ 分子形が多い (吸収されやすい形)</li>
              <li className="text-red-500 font-bold mt-2">しかし...！</li>
              <li>溶解度が低すぎて溶けないため、実際はあまり吸収されないことが多い。</li>
            </ul>
          </div>
          
          <div className="border-2 p-6 rounded-xl bg-green-50 border-green-200">
            <h4 className="font-bold text-2xl text-gray-800 border-b-2 pb-3 mb-4 border-green-300">小腸 (pH 6.0〜7.5)</h4>
            <ul className="text-lg space-y-3">
              <li className="text-blue-600">● 弱酸性薬物</li>
              <li>→ イオン形が増えてよく溶ける (溶解◎)</li>
              <li>→ 表面積が広大で血流も豊富</li>
              <li className="font-bold text-green-700 mt-2 text-xl">結論: 主要な吸収部位となる</li>
            </ul>
          </div>
        </div>

        <div className="p-6 bg-gray-100 rounded-xl text-gray-700 text-lg">
          <span className="font-bold text-xl">重要概念：Sink Condition (シンク状態)</span><br/>
          吸収された薬物はすぐに血流で運ばれるため、膜付近の濃度は常に低く保たれます。
          これにより、平衡が常に「溶解→透過」の方向へ進みます。
        </div>
      </div>
    </Slide>
  )
},
{
  title: "製剤学への応用：処方設計",
  content: (
    <Slide>
      <SectionTitle>溶けない薬をどう溶かす？</SectionTitle>
      <p className="mb-8 text-xl text-gray-600">
        創薬段階で見つかる候補化合物の約7割は「難溶性」です。
        酸塩基平衡の知識を使って、強制的に溶かす工夫が求められます。
      </p>
      
      <div className="space-y-6">
        <div className="flex items-start bg-white border-2 border-gray-200 p-6 rounded-2xl shadow-sm">
          <div className="bg-blue-100 p-4 rounded-full mr-6 text-blue-600 font-bold text-2xl w-16 h-16 flex items-center justify-center">1</div>
          <div>
            <h4 className="font-bold text-2xl text-gray-800">塩の形成 (Salt Formation)</h4>
            <p className="text-lg text-gray-600 mt-2">
              分子形のままでは溶けないため、対イオンを結合させて固体状態で「イオン結合」させます。
              <br/>例：NSAIDs(弱酸) ＋ Na <span className="text-blue-500">→ ナトリウム塩として溶解度UP</span>
            </p>
          </div>
        </div>

        <div className="flex items-start bg-white border-2 border-gray-200 p-6 rounded-2xl shadow-sm">
          <div className="bg-indigo-100 p-4 rounded-full mr-6 text-indigo-600 font-bold text-2xl w-16 h-16 flex items-center justify-center">2</div>
          <div>
            <h4 className="font-bold text-2xl text-gray-800">pH調整剤の添加</h4>
            <p className="text-lg text-gray-600 mt-2">
              注射剤や液剤では、バッファー（緩衝剤）を加えて、薬物が最も安定して溶けるpHに維持します。
              <br/><span className="text-red-500">※ただし、pHを極端にしすぎると注射時に疼痛の原因になるので注意！</span>
            </p>
          </div>
        </div>

        <div className="flex items-start bg-white border-2 border-gray-200 p-6 rounded-2xl shadow-sm">
          <div className="bg-purple-100 p-4 rounded-full mr-6 text-purple-600 font-bold text-2xl w-16 h-16 flex items-center justify-center">3</div>
          <div>
            <h4 className="font-bold text-2xl text-gray-800">析出（Precipitation）の回避</h4>
            <p className="text-lg text-gray-600 mt-2">
              静脈内注射（pH 7.4の血液中）した瞬間に、pH変化によって溶解度が下がり、血管内で結晶が析出すると血管炎や塞栓の原因になります。
              これを予測するのも酸塩基平衡の計算です。
            </p>
          </div>
        </div>
      </div>
    </Slide>
  )
},
{
  title: "まとめ",
  content: (
    <Slide>
      <SectionTitle>Take Home Message</SectionTitle>
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-10 rounded-2xl shadow-xl mb-12">
        <h3 className="text-3xl font-bold mb-6">酸塩基平衡は「共通言語」</h3>
        <p className="text-2xl opacity-90 leading-relaxed">
          pKaとpHの関係を理解することは、単なる計算ではありません。
          それは、薬物が体内でどう振る舞うかを予測し（生物薬剤学）、
          最適な形にデザインする（製剤学）ための、薬剤師にとっての最強のツールです。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-center">
        <div className="p-8 bg-gray-50 rounded-2xl">
          <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <div className="font-bold text-2xl text-gray-700">今日の復習項目</div>
          <div className="text-xl text-gray-500 mt-2">Henderson-Hasselbalch式、pH分配仮説</div>
        </div>
        <div className="p-8 bg-gray-50 rounded-2xl">
          <Brain className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <div className="font-bold text-2xl text-gray-700">考えるヒント</div>
          <div className="text-xl text-gray-500 mt-2">「この薬、食後(胃酸減少時)に飲んだら吸収はどうなる？」</div>
        </div>
      </div>
    </Slide>
  )
}


];

const nextSlide = () => {
setCurrentSlide((prev) => (prev + 1) % slides.length);
};

const prevSlide = () => {
setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
};

return (
<div className="w-screen h-screen bg-white flex flex-col font-sans text-gray-800 overflow-hidden">
{/* Header */}
<div className="bg-gray-800 text-white p-4 flex justify-between items-center z-10 shadow-md flex-shrink-0">
<div className="font-bold text-xl flex items-center">
<TestTube className="mr-3 text-blue-400" />
薬学基礎統合講義
</div>
<div className="text-base bg-gray-700 px-4 py-1 rounded-full">
Slide {currentSlide + 1} / {slides.length}
</div>
</div>

  {/* Slide Content Area */}
  <div className="flex-1 overflow-hidden relative">
    {slides[currentSlide].content}
  </div>

  {/* Navigation Controls */}
  <div className="bg-white p-4 border-t border-gray-200 flex justify-between items-center z-10 flex-shrink-0">
    <button 
      onClick={prevSlide}
      className={`flex items-center px-8 py-4 rounded-xl font-bold text-xl transition-all ${currentSlide === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'}`}
      disabled={currentSlide === 0}
    >
      <ChevronLeft className="mr-2 w-6 h-6" /> Back
    </button>
    
    <div className="flex space-x-3">
      {slides.map((_, index) => (
        <div 
          key={index}
          className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-blue-600 w-8' : 'bg-gray-300'}`}
        />
      ))}
    </div>

    <button 
      onClick={nextSlide}
      className="flex items-center px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-xl shadow-md hover:bg-blue-700 hover:shadow-lg transition-all"
    >
      {currentSlide === slides.length - 1 ? 'Finish' : 'Next'} <ChevronRight className="ml-2 w-6 h-6" />
    </button>
  </div>
</div>


);
};

export default App;