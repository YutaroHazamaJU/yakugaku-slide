import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, BookOpen, Pill, Activity, TestTube, ArrowRight, Brain, AlertTriangle, MapPin } from 'lucide-react';

// --- 計算ロジック ---
const calculateIonization = (ph, pka, type) => {
  const diff = ph - pka;
  let percentIonized;
  if (type === 'acid') {
    // 酸性: 10^(pH-pKa) = [A-]/[HA]
    percentIonized = 100 / (1 + Math.pow(10, -diff));
  } else {
    // 塩基性: 10^(pKa-pH) = [BH+]/[B]
    percentIonized = 100 / (1 + Math.pow(10, diff));
  }
  return percentIonized;
};

// --- 臓器判定ロジック ---
const getOrganInfo = (ph) => {
  if (ph < 3.5) return { name: '胃 (Stomach)', desc: '強酸性による殺菌・タンパク消化', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' };
  if (ph < 6.0) return { name: '十二指腸 (Duodenum)', desc: '胃酸の中和・胆汁/膵液の分泌', color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200' };
  if (ph < 7.5) return { name: '小腸 (空腸・回腸)', desc: '【主要吸収部位】広大な表面積', color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' };
  if (ph <= 8.5) return { name: '大腸 (Large Intestine)', desc: '水分の吸収・腸内細菌叢', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' };
  return { name: '塩基性環境', desc: '生体内では稀な環境', color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200' };
};

// --- 部品（コンポーネント） ---
// スライド全体のコンテナ：画面サイズに応じてパディングと文字サイズを調整
const Slide = ({ children, className = "" }) => (
  <div className={"flex flex-col h-full overflow-y-auto p-4 md:p-8 lg:p-12 text-base md:text-lg lg:text-xl xl:text-2xl " + className}>
    {children}
  </div>
);

// セクションタイトル：画面サイズに応じて大きく
const SectionTitle = ({ children }) => (
  <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-blue-800 mb-4 md:mb-8 border-b-4 border-blue-200 pb-2">
    {children}
  </h2>
);

// 箇条書き：アイコンサイズとテキストサイズを調整
const BulletPoint = ({ children, icon: Icon = ChevronRight }) => (
  <li className="flex items-start mb-4 md:mb-6 text-gray-800 text-base md:text-xl lg:text-2xl">
    <Icon className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 mr-3 md:mr-4 text-blue-500 flex-shrink-0 mt-1" />
    <span>{children}</span>
  </li>
);

// インタラクティブ実験：pH & pKa シミュレーター
const PhSimulator = () => {
  const [ph, setPh] = useState(1.5);
  const [pka, setPka] = useState(4.5);
  const [drugType, setDrugType] = useState('acid');

  const ionization = calculateIonization(ph, pka, drugType);
  const unionized = 100 - ionization;
  
  const organ = getOrganInfo(ph);

  const handlePreset = (type, defaultPka) => {
    setDrugType(type);
    setPka(defaultPka);
  };

  return (
    <div className="bg-white p-3 md:p-6 rounded-xl shadow-lg border border-gray-200 mt-2 text-sm md:text-base lg:text-lg">
      <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 mb-4 flex items-center">
        <TestTube className="mr-3 w-6 h-6 md:w-8 md:h-8 text-blue-600" />
        実験：pHと体内動態
      </h3>

      {/* 1. 薬物タイプ選択ボタン (スマホでは縦並び、タブレット以上で横並び) */}
      <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4 mb-6">
        <button 
          onClick={() => handlePreset('acid', 4.5)}
          className={"px-4 py-2 md:px-6 md:py-3 rounded-full font-bold text-base md:text-lg transition-all shadow-sm " + (drugType === 'acid' ? 'bg-blue-600 text-white ring-2 ring-blue-300' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}
        >
          弱酸性
        </button>
        <button 
          onClick={() => handlePreset('base', 8.0)}
          className={"px-4 py-2 md:px-6 md:py-3 rounded-full font-bold text-base md:text-lg transition-all shadow-sm " + (drugType === 'base' ? 'bg-indigo-600 text-white ring-2 ring-indigo-300' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}
        >
          弱塩基性
        </button>
      </div>

      {/* 2. スライダーエリア */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6">
        
        {/* 左側：pH Slider と 臓器表示 */}
        <div className="bg-gray-50 p-3 md:p-4 rounded-xl flex flex-col justify-between border border-gray-200">
          <div>
            <label className="block text-gray-700 font-bold mb-2 text-base md:text-lg flex justify-between">
              <span>環境 pH</span>
              <span className="text-2xl md:text-3xl text-blue-600 font-mono">{ph.toFixed(1)}</span>
            </label>
            <input 
              type="range" min="1" max="9" step="0.1" 
              value={ph}
              onChange={(e) => setPh(parseFloat(e.target.value))}
              className="w-full h-4 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-blue-600 mb-4"
            />
          </div>

          {/* 現在の臓器表示 */}
          <div className={`p-3 md:p-4 rounded-lg border-l-8 ${organ.bg} ${organ.border} transition-colors duration-300 shadow-sm`}>
             <div className={`font-bold text-lg md:text-xl flex items-center mb-1 ${organ.color}`}>
               <MapPin className="w-5 h-5 md:w-6 md:h-6 mr-2 flex-shrink-0" />
               {organ.name}
             </div>
             <div className="text-xs md:text-sm text-gray-700 ml-7 md:ml-8 font-medium">
               {organ.desc}
             </div>
          </div>
        </div>

        {/* 右側：pKa Slider */}
        <div className="bg-gray-50 p-3 md:p-4 rounded-xl border border-gray-200">
          <label className="block text-gray-700 font-bold mb-2 text-base md:text-lg flex justify-between">
            <span>薬物の pKa</span>
            <span className="text-2xl md:text-3xl text-pink-600 font-mono">{pka.toFixed(1)}</span>
          </label>
          <input 
            type="range" min="2" max="10" step="0.1" 
            value={pka}
            onChange={(e) => setPka(parseFloat(e.target.value))}
            className="w-full h-4 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-pink-500"
          />
          <div className="text-xs md:text-sm text-gray-500 mt-4 leading-relaxed">
            <p>● 酸性薬物 (pKa 3-5)</p>
            <p>● 塩基性薬物 (pKa 7-9)</p>
            <p className="mt-2 opacity-75">※スライダーで値を変更してシミュレーション</p>
          </div>
        </div>
      </div>

      {/* 3. 結果表示エリア */}
      <div className="grid grid-cols-2 gap-4 md:gap-6">
        {/* 溶解性（イオン形） */}
        <div className="bg-blue-50 p-3 md:p-4 rounded-xl text-center border border-blue-200 shadow-sm">
          <div className="text-gray-600 mb-1 font-bold text-xs md:text-base">水への溶解性 (イオン形)</div>
          <div className="text-2xl md:text-4xl font-bold text-blue-600 mb-2">{ionization.toFixed(1)}%</div>
          <div className="h-16 md:h-24 flex items-end justify-center px-2 md:px-4">
             <div className="w-full bg-blue-200 rounded-t-sm relative overflow-hidden rounded-b-lg border border-blue-300" style={{height: '100%'}}>
                <div 
                  className="absolute bottom-0 left-0 w-full bg-blue-500 transition-all duration-300"
                  style={{ height: String(ionization) + "%", opacity: 0.8 }}
                ></div>
             </div>
          </div>
          <p className="mt-2 text-xs md:text-sm text-blue-800 font-bold">
            {ionization > 50 ? '溶ける' : '析出しやすい'}
          </p>
        </div>

        {/* 膜透過性（分子形） */}
        <div className="bg-orange-50 p-3 md:p-4 rounded-xl text-center border border-orange-200 shadow-sm">
          <div className="text-gray-600 mb-1 font-bold text-xs md:text-base">膜透過性 (分子形)</div>
          <div className="text-2xl md:text-4xl font-bold text-orange-600 mb-2">{unionized.toFixed(1)}%</div>
          <div className="h-16 md:h-24 flex items-end justify-center px-2 md:px-4">
             <div className="w-full bg-orange-200 rounded-t-sm relative overflow-hidden rounded-b-lg border border-orange-300" style={{height: '100%'}}>
                <div 
                  className="absolute bottom-0 left-0 w-full bg-orange-500 transition-all duration-300"
                  style={{ height: String(unionized) + "%", opacity: 0.8 }}
                ></div>
             </div>
          </div>
          <p className="mt-2 text-xs md:text-sm text-orange-800 font-bold">
            {unionized > 50 ? '吸収される' : '吸収されにくい'}
          </p>
        </div>
      </div>
      
      <div className="mt-4 text-xs md:text-sm text-gray-600 bg-gray-100 p-3 rounded border-l-4 border-gray-500 leading-relaxed">
        <strong>解説:</strong> {drugType === 'acid' ? '弱酸性' : '弱塩基性'}薬物 (pKa {pka.toFixed(1)}) は、
        <span className={`font-bold mx-1 ${organ.color}`}>{organ.name}</span>
        (pH {ph.toFixed(1)}) にいるとき、
        <span className={unionized > 50 ? "font-bold text-orange-600" : ""}>分子形が{unionized.toFixed(0)}%</span>になります。
      </div>
    </div>
  );
};

// --- メインアプリ ---
const App = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // キーボード操作のサポート
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []); // 空配列でマウント時のみ実行

  const slides = [
    {
      content: (
        <Slide className="flex flex-col justify-center items-center text-center bg-gradient-to-br from-blue-50 to-white">
          <div className="max-w-5xl animate-fade-in-up">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-800 mb-6 md:mb-10 leading-tight">
              酸塩基平衡と<br/>溶解現象の重要性
            </h1>
            <p className="text-lg md:text-2xl lg:text-3xl text-gray-600 mb-8 md:mb-16">
              物理化学の基礎から
              <span className="font-bold text-blue-600 mx-2 block md:inline">生物薬剤学</span>・
              <span className="font-bold text-indigo-600 mx-2 block md:inline">製剤学</span>の実践へ
            </p>
            <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-8">
              <div className="flex items-center text-lg md:text-xl text-gray-500 bg-white px-4 py-2 rounded-lg shadow-sm">
                <Brain className="w-6 h-6 md:w-8 md:h-8 mr-2 text-blue-500" /> 基礎理論
              </div>
              <ArrowRight className="text-gray-300 w-8 h-8 self-center hidden md:block" />
              <div className="text-gray-300 w-8 h-8 self-center block md:hidden transform rotate-90">↓</div>
              <div className="flex items-center text-lg md:text-xl text-gray-500 bg-white px-4 py-2 rounded-lg shadow-sm">
                <Pill className="w-6 h-6 md:w-8 md:h-8 mr-2 text-indigo-500" /> 医薬品開発
              </div>
            </div>
            <div className="mt-10 md:mt-20 text-gray-400 text-base md:text-lg animate-bounce">
              Start Presentation ↓
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center h-full">
            <div>
              <p className="text-lg md:text-2xl text-gray-600 mb-6 md:mb-8 leading-relaxed">
                多くの医薬品は「弱酸」または「弱塩基」の有機化合物です。
                これらは環境のpHによって、その姿（存在状態）を劇的に変えます。
              </p>
              <ul className="space-y-4 md:space-y-6">
                <BulletPoint icon={AlertTriangle}>
                  <strong>イオン形 (Ionized):</strong> <br/>
                  水によく溶けるが、脂質の膜（細胞膜）を通れない。
                </BulletPoint>
                <BulletPoint icon={AlertTriangle}>
                  <strong>分子形 (Unionized):</strong> <br/>
                  膜は通れるが、水に溶けにくい。
                </BulletPoint>
              </ul>
              <div className="mt-6 md:mt-10 p-4 md:p-6 bg-red-50 text-red-800 rounded-xl border-l-8 border-red-500 text-lg md:text-xl shadow-md">
                <span className="font-bold">重要:</span> 薬が効くためには「溶けて」かつ「吸収される」必要があります。
                このバランスを支配するのが <span className="font-bold text-xl md:text-2xl">pH</span> と <span className="font-bold text-xl md:text-2xl">pKa</span> です。
              </div>
            </div>
            <div className="flex justify-center items-center mt-6 lg:mt-0">
              <div className="relative w-64 h-64 md:w-80 md:h-80 bg-gradient-to-b from-blue-100 to-orange-100 rounded-full flex items-center justify-center border-4 border-dashed border-gray-300 shadow-inner">
                <div className="absolute top-0 text-center w-full mt-6 md:mt-10">
                  <div className="font-bold text-lg md:text-2xl text-blue-600">水相 (消化管液)</div>
                  <div className="text-sm md:text-base">親水性・イオン形</div>
                </div>
                <div className="w-full h-1 bg-gray-400 absolute"></div>
                <div className="absolute bottom-0 text-center w-full mb-6 md:mb-10">
                  <div className="font-bold text-lg md:text-2xl text-orange-600">生体膜 (脂質)</div>
                  <div className="text-sm md:text-base">疎水性・分子形</div>
                </div>
                <div className="z-10 bg-white p-2 md:p-4 rounded shadow-lg text-sm md:text-lg font-bold border border-gray-200">
                  Henderson-<br className="block md:hidden"/>Hasselbalch式<br/>が支配する世界
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
        <Slide className="bg-gray-50">
          <SectionTitle>Henderson-Hasselbalch式の可視化</SectionTitle>
          <p className="text-gray-600 mb-2 text-lg md:text-xl">
            下のスライダーでpHやpKaを動かし、体内動態の変化を確認しましょう。
          </p>
          {/* シミュレーター */}
          <PhSimulator />
        </Slide>
      )
    },
    {
      title: "生物薬剤学への応用：吸収",
      content: (
        <Slide>
          <SectionTitle>pH分配仮説と吸収部位</SectionTitle>
          <div className="flex flex-col space-y-6 md:space-y-8">
            <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border-l-8 border-green-500">
              <h3 className="font-bold text-xl md:text-2xl text-green-700 mb-2 flex items-center">
                <Activity className="mr-3 w-6 h-6 md:w-8 md:h-8" /> 体内でのドラマ
              </h3>
              <p className="text-lg md:text-xl text-gray-700">
                薬物は消化管内を移動しながら、刻々と変化するpH環境にさらされます。
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              <div className="border-2 p-4 md:p-6 rounded-xl hover:shadow-md transition-shadow">
                <h4 className="font-bold text-xl md:text-2xl text-gray-800 border-b-2 pb-3 mb-4">胃 (pH 1.2〜2.0)</h4>
                <ul className="text-base md:text-lg space-y-3">
                  <li className="text-blue-600 font-bold">● 弱酸性薬物</li>
                  <li>→ 分子形が多い (吸収されやすい形)</li>
                  <li className="text-red-500 font-bold mt-2 flex items-center"><AlertTriangle className="w-5 h-5 mr-1"/> しかし...！</li>
                  <li>溶解度が低すぎて溶けないため、実際はあまり吸収されないことが多い。</li>
                </ul>
              </div>
              
              <div className="border-2 p-4 md:p-6 rounded-xl bg-green-50 border-green-200 hover:shadow-md transition-shadow">
                <h4 className="font-bold text-xl md:text-2xl text-gray-800 border-b-2 pb-3 mb-4 border-green-300">小腸 (pH 6.0〜7.5)</h4>
                <ul className="text-base md:text-lg space-y-3">
                  <li className="text-blue-600 font-bold">● 弱酸性薬物</li>
                  <li>→ イオン形が増えてよく溶ける (溶解◎)</li>
                  <li>→ 表面積が広大で血流も豊富</li>
                  <li className="font-bold text-green-700 mt-2 text-lg md:text-xl bg-green-100 p-2 rounded">結論: 主要な吸収部位となる</li>
                </ul>
              </div>
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
          <p className="mb-6 md:mb-8 text-lg md:text-xl text-gray-600">
            創薬段階で見つかる候補化合物の約7割は「難溶性」です。
            酸塩基平衡の知識を使って、強制的に溶かす工夫が求められます。
          </p>
          
          <div className="space-y-4 md:space-y-6">
            <div className="flex items-start bg-white border-2 border-gray-200 p-4 md:p-6 rounded-2xl shadow-sm hover:border-blue-300 transition-colors">
              <div className="bg-blue-100 p-3 md:p-4 rounded-full mr-4 md:mr-6 text-blue-600 font-bold text-xl md:text-2xl w-12 h-12 md:w-16 md:h-16 flex items-center justify-center flex-shrink-0">1</div>
              <div>
                <h4 className="font-bold text-xl md:text-2xl text-gray-800">塩の形成 (Salt Formation)</h4>
                <p className="text-base md:text-lg text-gray-600 mt-2">
                  分子形のままでは溶けないため、対イオンを結合させて固体状態で「イオン結合」させます。
                  <br/>例：NSAIDs(弱酸) ＋ Na <span className="text-blue-500 font-bold">→ ナトリウム塩として溶解度UP</span>
                </p>
              </div>
            </div>

            <div className="flex items-start bg-white border-2 border-gray-200 p-4 md:p-6 rounded-2xl shadow-sm hover:border-indigo-300 transition-colors">
              <div className="bg-indigo-100 p-3 md:p-4 rounded-full mr-4 md:mr-6 text-indigo-600 font-bold text-xl md:text-2xl w-12 h-12 md:w-16 md:h-16 flex items-center justify-center flex-shrink-0">2</div>
              <div>
                <h4 className="font-bold text-xl md:text-2xl text-gray-800">pH調整剤の添加</h4>
                <p className="text-base md:text-lg text-gray-600 mt-2">
                  注射剤や液剤では、バッファー（緩衝剤）を加えて、薬物が最も安定して溶けるpHに維持します。
                  <br/><span className="text-red-500 text-sm md:text-base">※ただし、pHを極端にしすぎると注射時に疼痛の原因になるので注意！</span>
                </p>
              </div>
            </div>

            <div className="flex items-start bg-white border-2 border-gray-200 p-4 md:p-6 rounded-2xl shadow-sm hover:border-purple-300 transition-colors">
              <div className="bg-purple-100 p-3 md:p-4 rounded-full mr-4 md:mr-6 text-purple-600 font-bold text-xl md:text-2xl w-12 h-12 md:w-16 md:h-16 flex items-center justify-center flex-shrink-0">3</div>
              <div>
                <h4 className="font-bold text-xl md:text-2xl text-gray-800">析出（Precipitation）の回避</h4>
                <p className="text-base md:text-lg text-gray-600 mt-2">
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
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 md:p-10 rounded-2xl shadow-xl mb-8 md:mb-12 transform hover:scale-[1.01] transition-transform">
            <h3 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">酸塩基平衡は「共通言語」</h3>
            <p className="text-lg md:text-2xl opacity-90 leading-relaxed">
              pKaとpHの関係を理解することは、単なる計算ではありません。
              それは、薬物が体内でどう振る舞うかを予測し（生物薬剤学）、
              最適な形にデザインする（製剤学）ための、薬剤師にとっての最強のツールです。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 text-center">
            <div className="p-6 md:p-8 bg-gray-50 rounded-2xl border border-gray-200">
              <BookOpen className="w-10 h-10 md:w-12 md:h-12 mx-auto text-blue-400 mb-4" />
              <div className="font-bold text-xl md:text-2xl text-gray-700">今日の復習項目</div>
              <div className="text-lg md:text-xl text-gray-500 mt-2">Henderson-Hasselbalch式、pH分配仮説</div>
            </div>
            <div className="p-6 md:p-8 bg-gray-50 rounded-2xl border border-gray-200">
              <Brain className="w-10 h-10 md:w-12 md:h-12 mx-auto text-indigo-400 mb-4" />
              <div className="font-bold text-xl md:text-2xl text-gray-700">考えるヒント</div>
              <div className="text-lg md:text-xl text-gray-500 mt-2">「この薬、食後(胃酸減少時)に飲んだら吸収はどうなる？」</div>
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
      <div className="bg-gray-800 text-white p-3 md:p-4 flex justify-between items-center z-10 shadow-md flex-shrink-0">
        <div className="font-bold text-lg md:text-xl flex items-center">
          <TestTube className="mr-2 md:mr-3 text-blue-400" />
          制作：間祐太朗
        </div>
        <div className="text-sm md:text-base bg-gray-700 px-3 py-1 md:px-4 md:py-1 rounded-full">
          Slide {currentSlide + 1} / {slides.length}
        </div>
      </div>

      {/* Slide Content Area */}
      <div className="flex-1 overflow-hidden relative">
        {slides[currentSlide].content}
      </div>

      {/* Navigation Controls */}
      <div className="bg-white p-3 md:p-4 border-t border-gray-200 flex justify-between items-center z-10 flex-shrink-0">
        <button 
          onClick={prevSlide}
          className={`flex items-center px-4 py-2 md:px-8 md:py-4 rounded-xl font-bold text-lg md:text-xl transition-all ${currentSlide === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'}`}
          disabled={currentSlide === 0}
        >
          <ChevronLeft className="mr-1 md:mr-2 w-5 h-5 md:w-6 md:h-6" /> <span className="hidden md:inline">Back</span>
        </button>
        
        <div className="flex space-x-2 md:space-x-3">
          {slides.map((_, index) => (
            <div 
              key={index}
              className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-blue-600 w-6 md:w-8' : 'bg-gray-300'}`}
            />
          ))}
        </div>

        <button 
          onClick={nextSlide}
          className="flex items-center px-4 py-2 md:px-8 md:py-4 bg-blue-600 text-white rounded-xl font-bold text-lg md:text-xl shadow-md hover:bg-blue-700 hover:shadow-lg transition-all"
        >
          <span className="hidden md:inline">{currentSlide === slides.length - 1 ? 'Finish' : 'Next'}</span> <span className="md:hidden">Next</span> <ChevronRight className="ml-1 md:ml-2 w-5 h-5 md:w-6 md:h-6" />
        </button>
      </div>
    </div>
  );
};

export default App;