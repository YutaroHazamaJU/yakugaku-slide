import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, BookOpen, Pill, Activity, TestTube, ArrowRight, Brain, AlertTriangle, MapPin, Stethoscope, MousePointerClick } from 'lucide-react';
// グラフ描画用（追加）
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';

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
const Slide = ({ children, className = "" }) => (
  <div className={"flex flex-col h-full overflow-y-auto p-4 md:p-8 lg:p-12 text-base md:text-lg lg:text-xl xl:text-2xl " + className}>
    {children}
  </div>
);

const SectionTitle = ({ children }) => (
  <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-blue-800 mb-4 md:mb-8 border-b-4 border-blue-200 pb-2">
    {children}
  </h2>
);


const BulletPoint = ({ children, icon: Icon = ChevronRight }) => (
  <li className="flex items-start mb-4 md:mb-6 text-gray-800 text-base md:text-xl lg:text-2xl">
    <Icon className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 mr-3 md:mr-4 text-blue-500 flex-shrink-0 mt-1" />
    <span>{children}</span>
  </li>
);

// 受動拡散 vs 能動輸送 グラフ用データ生成関数
const makeTransportData = (Vmax = 1, Km = 1, kPassive = 0.4) => {
  const data = [];
  for (let C = 0; C <= 5; C += 0.2) {
    const passive = kPassive * C;
    const active = (Vmax * C) / (Km + C);
    data.push({ C, passive, active });
  }
  return data;
};

// 受動拡散 vs 能動輸送 グラフコンポーネント
const PassiveVsActiveChart = () => {
  const data = makeTransportData(1, 1, 0.4);

  return (
    <div className="w-full h-64 md:h-80 mt-6">
      <ResponsiveContainer>
        <LineChart
          data={data}
          margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="C"
            label={{
              value: '薬物濃度 C',
              position: 'insideBottomRight',
              offset: -5
            }}
          />
          <YAxis
            label={{
              value: '膜透過速度 dQ/dt',
              angle: -90,
              position: 'insideLeft'
            }}
          />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="passive"
            name="受動拡散"
            stroke="#2563eb"
            strokeWidth={3}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="active"
            name="能動輸送"
            stroke="#9333ea"
            strokeWidth={3}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// インタラクティブ実験：pH & pKa シミュレーター
const PhSimulator = () => {
  const [ph, setPh] = useState(1.5);
  const [pka, setPka] = useState(4.5);
  const [drugType, setDrugType] = useState('acid');

  const ionization = calculateIonization(ph, pka, drugType);
  const unionized = 100 - ionization;
  
  const organ = getOrganInfo(ph);

  // ★代表的な薬物リスト
  const representativeDrugs = {
    acid: [
      { name: 'アスピリン', pka: 3.5 },
      { name: 'フロセミド', pka: 3.9 },
      { name: 'インドメタシン', pka: 4.5 },
      { name: 'ワルファリン', pka: 5.0 },
      { name: 'フェニトイン', pka: 8.3 },
    ],
    base: [
      { name: 'ジアゼパム', pka: 3.4 },
      { name: 'コデイン', pka: 8.2 },
      { name: 'ジフェンヒドラミン', pka: 9.0 },
      { name: 'クロルプロマジン', pka: 9.3 },
      { name: 'イミプラミン', pka: 9.5 },
    ]
  };

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

      {/* タイプ選択ボタン */}
      <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4 mb-6">
        <button 
          onClick={() => handlePreset('acid', 4.5)}
          className={"px-4 py-2 md:px-6 md:py-3 rounded-full font-bold text-base md:text-lg transition-all shadow-sm " + (drugType === 'acid' ? 'bg-blue-600 text-white ring-2 ring-blue-300' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}
        >
          弱酸性薬物
        </button>
        <button 
          onClick={() => handlePreset('base', 9.0)}
          className={"px-4 py-2 md:px-6 md:py-3 rounded-full font-bold text-base md:text-lg transition-all shadow-sm " + (drugType === 'base' ? 'bg-indigo-600 text-white ring-2 ring-indigo-300' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}
        >
          弱塩基性薬物
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6">
        {/* 左側：pH Slider */}
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

        {/* 右側：pKa Slider と ★薬物リスト */}
        <div className="bg-gray-50 p-3 md:p-4 rounded-xl border border-gray-200 flex flex-col">
          <div>
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
          </div>
          
          {/* ★実際の薬物選択エリア */}
          <div className="mt-4 flex-1">
            <div className="text-xs md:text-sm text-gray-500 mb-2 font-bold flex items-center">
              <MousePointerClick className="w-4 h-4 mr-1"/>
              代表的な{drugType === 'acid' ? '酸性' : '塩基性'}薬物 (クリックで設定)
            </div>
            <div className="flex flex-wrap gap-2">
              {representativeDrugs[drugType].map((drug) => (
                <button
                  key={drug.name}
                  onClick={() => setPka(drug.pka)}
                  className={`text-xs md:text-sm px-2 py-1 rounded border transition-colors ${
                    pka === drug.pka 
                      ? (drugType === 'acid' ? 'bg-blue-100 border-blue-400 text-blue-700 font-bold' : 'bg-indigo-100 border-indigo-400 text-indigo-700 font-bold') 
                      : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {drug.name} ({drug.pka})
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 結果表示エリア */}
      <div className="grid grid-cols-2 gap-4 md:gap-6">
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
        これは<span className="font-bold text-red-500 mx-1">溶解性と膜透過性のトレードオフ</span>を示唆しています。
      </div>
    </div>
  );
};

// --- メインアプリ ---
const App = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
      title: "物理化学で学んだことは薬剤学でどう活きる？",
      content: (
        <Slide>
          <SectionTitle>「式」を使って，製剤や吸収を読み解く</SectionTitle>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            {/* 左：物理化学でやったことの振り返り */}
            <div>
              <p className="text-lg md:text-2xl text-gray-600 mb-6 leading-relaxed">
                直前の物理化学では，次のような内容を学びました：
              </p>
              <ul className="space-y-4 md:space-y-6">
                <BulletPoint>
                  Henderson–Hasselbalch式：
                  <span className="font-mono bg-gray-100 px-2 py-0.5 rounded ml-1">
                    <InlineMath math={String.raw`\mathrm{pH} = \mathrm{p}K_a + \log\left(\frac{[\mathrm{A}^-]}{[\mathrm{HA}]}\right)`} />
                  </span>
                </BulletPoint>
                <BulletPoint>
                  緩衝液・pKa・pI など
                  「<span className="font-bold text-blue-600">どの形がどれくらい存在するか</span>」
                  を決める考え方
                </BulletPoint>
              </ul>
            </div>

            {/* 右：薬剤での具体例 */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 md:p-6 shadow-sm">
              <h3 className="font-bold text-xl md:text-2xl text-gray-800 mb-3 flex items-center">
                <Pill className="w-6 h-6 md:w-8 md:h-8 mr-2 text-indigo-600" />
                薬剤学ではこう使う！
              </h3>
              <ul className="space-y-3 text-base md:text-lg text-gray-700">
                <li>
                  ● <span className="font-bold">どのpHでよく溶けるか？</span><br />
                  → 溶解度–pHプロファイルの計算に HH式をそのまま利用。
                </li>
                <li>
                  ● <span className="font-bold">どの部位で吸収されやすいか？</span><br />
                  → 消化管ごとのpHと pKa から，
                  「<span className="font-bold text-orange-600">分子形の割合</span>」を予測。
                </li>
                <li>
                  ● <span className="font-bold">注射剤や点滴のpH設計</span><br />
                  → 溶ける pH と，患者さんへの刺激性のバランスをとる。
                </li>
                <li>
                  ● <span className="font-bold">国試の計算問題</span><br />
                  → 今日このあと解説する
                  「溶解度」「溶出性」「pH分配」の問題は，
                  全て物理化学で学んだ考え方の延長線上。
                </li>
              </ul>
              <div className="mt-4 p-3 md:p-4 bg-blue-50 border-l-4 border-blue-400 rounded text-sm md:text-base text-gray-700">
                この授業では，
                <span className="font-bold text-blue-700 mx-1">物理化学で学んだ式</span>
                を「現実の製剤・吸収・国試問題」にどう結びつけるかを体感してもらいます。
              </div>
            </div>
          </div>
        </Slide>
      )
    },
    {
      title: "なぜ「酸塩基平衡」を学ぶのか？",
      content: (
        <Slide>
          <SectionTitle>溶解性と膜透過性のトレードオフ</SectionTitle>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center h-full">
            <div>
              <p className="text-lg md:text-2xl text-gray-600 mb-6 md:mb-8 leading-relaxed">
                多くの医薬品は「弱酸」または「弱塩基」の有機化合物です。
                これらは環境のpHによって、その<span className="font-bold text-blue-600">存在形</span>（イオン形か分子形か）を劇的に変えます。
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
                この相反する性質のバランスを支配するのが <span className="font-bold text-xl md:text-2xl">pH</span> と <span className="font-bold text-xl md:text-2xl">pKa</span> です。
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
          <PhSimulator />
        </Slide>
      )
    },
    {
      title: "生物薬剤学への応用：吸収",
      content: (
        <Slide>
          <SectionTitle>消化管内移動とpHプロファイル</SectionTitle>
          <div className="flex flex-col space-y-6 md:space-y-8">
            <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border-l-8 border-green-500">
              <h3 className="font-bold text-xl md:text-2xl text-green-700 mb-2 flex items-center">
                <Activity className="mr-3 w-6 h-6 md:w-8 md:h-8" /> 消化管内移動とpHプロファイル
              </h3>
              <p className="text-lg md:text-xl text-gray-700">
                薬物は消化管内を移動しながら、刻々と変化するpH環境にさらされます。
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
              
              {/* 1. 胃 (弱酸) */}
              <div className="border-2 p-4 md:p-6 rounded-xl bg-white hover:shadow-md transition-shadow">
                <h4 className="font-bold text-xl text-gray-800 border-b-2 pb-2 mb-3">胃 (pH 1.2〜)</h4>
                <div className="text-base space-y-2">
                  <div className="font-bold text-blue-600">● 弱酸性薬物</div>
                  <div>→ 分子形が多い (吸収◎)</div>
                  <div className="text-red-500 text-sm font-bold flex items-center mt-1">
                    <AlertTriangle className="w-4 h-4 mr-1"/>溶解度が低すぎる
                  </div>
                  <div className="text-sm text-gray-500 mt-2 border-t pt-2">
                    <span className="font-bold text-indigo-600">● 弱塩基性薬物</span><br/>
                    → 完全イオン化 (溶解◎)<br/>
                    → 吸収はされない
                  </div>
                </div>
              </div>
              
              {/* 2. 小腸 (メイン) */}
              <div className="border-2 p-4 md:p-6 rounded-xl bg-green-50 border-green-200 hover:shadow-md transition-shadow">
                <h4 className="font-bold text-xl text-gray-800 border-b-2 pb-2 mb-3 border-green-300">小腸 (pH 6.5〜)</h4>
                <div className="text-base space-y-2">
                  <div className="font-bold text-blue-600">● 弱酸性薬物</div>
                  <div>→ イオン形増 (溶解◎)</div>
                  <div className="font-bold text-green-700 mt-2 bg-green-100 p-1 rounded text-center text-sm">
                    主要な吸収部位！
                  </div>
                  <div className="text-sm text-gray-500 mt-2 border-t pt-2 border-green-200">
                    <span className="font-bold text-indigo-600">● 弱塩基性薬物</span><br/>
                    → 分子形が増え始める<br/>
                    → 吸収が進行する
                  </div>
                </div>
              </div>

              {/* 3. 大腸・組織 (弱塩基) */}
              <div className="border-2 p-4 md:p-6 rounded-xl bg-indigo-50 border-indigo-200 hover:shadow-md transition-shadow">
                <h4 className="font-bold text-xl text-gray-800 border-b-2 pb-2 mb-3 border-indigo-300">組織/大腸</h4>
                <div className="text-base space-y-2">
                  <div className="font-bold text-indigo-600">● 弱塩基性薬物</div>
                  <div>(pKa 8-9のもの)</div>
                  <div className="mt-2">
                    組織（細胞内pH 7.0等）や大腸下部で分子形を維持しやすい。
                  </div>
                  <div className="font-bold text-indigo-700 mt-2 bg-indigo-100 p-1 rounded text-center text-sm">
                    組織移行性が高い
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    ※多くの向精神薬や抗がん剤は弱塩基性で、脳や細胞内へ移行しやすい。
                  </div>
                </div>
              </div>

            </div>

            <div className="mt-4 md:mt-6 bg-yellow-50 p-4 md:p-5 rounded-xl border-l-4 border-yellow-400 text-sm md:text-base text-gray-800">
              <h4 className="font-bold text-base md:text-lg text-yellow-800 mb-2 flex items-center">
                <Stethoscope className="w-4 h-4 md:w-5 md:h-5 mr-2 text-yellow-700" />
                イオン形でも吸収されるケース：トランスポーター
              </h4>
              <p className="leading-relaxed">
                「イオン形薬物は膜を通れないから吸収されない」というわけではありません。
                受動拡散では<strong className="text-orange-700">分子形</strong>が有利ですが、
                <strong className="text-blue-700 mx-1">PEPT1, OATP, OCT などのトランスポーター</strong>は
                イオン形を含む特定の構造を<strong>担体介在輸送</strong>で細胞内へ運び込みます。
              </p>
              <ul className="mt-2 list-disc list-inside space-y-1">
                <li>受動拡散：分子形が主役（pH・pKa・HH式で割合を予測）</li>
                <li>トランスポーター：イオン形でも「基質」なら吸収されうる</li>
              </ul>
              <p className="mt-2 text-xs md:text-sm text-gray-600">
                国試では「イオン形＝全く吸収されない」ではなく，
                <span className="font-bold">「受動拡散では不利だが，トランスポーターにより吸収されうる」</span>
                という整理が重要です。
              </p>
            </div>
          </div>
        </Slide>
      )
    },
    {
      title: "受動拡散と能動輸送：式で整理",
      content: (
        <Slide>
          <SectionTitle>受動拡散 vs 能動輸送：数式で見る違い</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-start">
            {/* 左：受動拡散（フィックの拡散式） */}
            <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-blue-200">
              <h3 className="font-bold text-xl md:text-2xl text-blue-700 mb-3 flex items-center">
                <Activity className="w-6 h-6 md:w-7 md:h-7 mr-2 text-blue-500" />
                受動拡散：フィックの拡散式
              </h3>
              <p className="text-base md:text-lg text-gray-700 mb-3">
                生体膜を「単純な膜」とみなしたときの拡散フラックス J は、フィックの拡散式で表されます。
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 md:p-4 mb-3 text-center">
                <BlockMath math={String.raw`J = -D \frac{dC}{dx} \approx P\,(C_{\text{out}} - C_{\text{in}})`} />
              </div>
              <ul className="list-disc list-inside text-sm md:text-base text-gray-700 space-y-1">
                <li>D：拡散係数</li>
                <li>P：透過係数（D や膜厚をまとめた値）</li>
                <li>C：膜の両側の薬物濃度</li>
              </ul>
              <div className="mt-3 bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded text-sm md:text-base text-gray-700">
                生体膜透過を考えるとき、
                <span className="font-bold text-blue-700 mx-1">"C" は分子形薬物濃度</span>
                とみなします。したがって、
                <span className="font-bold text-red-600">分子形の濃度勾配</span>
                が受動拡散の駆動力になります。
              </div>
            </div>

            {/* 右：担体介在輸送・能動輸送（ミカエリス–メンテン式） */}
            <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-purple-200">
              <h3 className="font-bold text-xl md:text-2xl text-purple-700 mb-3 flex items-center">
                <Brain className="w-6 h-6 md:w-7 md:h-7 mr-2 text-purple-500" />
                能動輸送：ミカエリス–メンテン型
              </h3>
              <p className="text-base md:text-lg text-gray-700 mb-3">
                トランスポーターを介する輸送速度 v は、しばしばミカエリス–メンテン型の式で近似されます。
              </p>
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 md:p-4 mb-3 text-center">
                <BlockMath math={String.raw`v = \frac{V_{\max}[S]}{K_m + [S]}` } />
              </div>
              <ul className="list-disc list-inside text-sm md:text-base text-gray-700 space-y-1">
                <li>[S]：基質（薬物）の濃度</li>
                <li>V<sub>max</sub>：最大輸送速度（輸送担体の数で決まる）</li>
                <li>K<sub>m</sub>：基質親和性を表す定数</li>
              </ul>
              <div className="mt-3 bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded text-sm md:text-base text-gray-700">
                能動輸送では、ATP や Na<sup>+</sup> 勾配などの
                <span className="font-bold text-indigo-700 mx-1">エネルギー供給</span>
                により、
                <span className="font-bold">薬物の濃度勾配に逆らって</span>
                でも輸送が可能です。
                一方で、
                <span className="font-bold text-purple-700 mx-1">速度や飽和</span>
                の観点からは、[S]（基質薬物濃度）が重要になります。
              </div>
            </div>
          </div>

          <PassiveVsActiveChart />

          <div className="mt-6 bg-gray-100 border-l-4 border-gray-500 p-4 rounded-xl text-sm md:text-base text-gray-800">
            <p className="font-bold mb-1">まとめ：</p>
            <ul className="list-disc list-inside space-y-1">
              <li>受動拡散：フィックの拡散式に従い、<span className="font-bold text-blue-700">分子形薬物の濃度勾配</span>が駆動力</li>
              <li>能動輸送：方向付けは ATP やイオン勾配によって決まり、<span className="font-bold text-purple-700">基質濃度 [S]</span>は速度・飽和を決める要因</li>
            </ul>
          </div>
        </Slide>
      )
    },
    {
      title: "製剤学への応用：処方設計",
      content: (
        <Slide>
          <SectionTitle>難溶性薬物の可溶化手法</SectionTitle>
          <p className="mb-6 md:mb-8 text-lg md:text-xl text-gray-600">
            創薬段階で見つかる候補化合物の約7割は「難溶性」です。
            酸塩基平衡の知識を使って、物理化学的に溶解度を向上させるアプローチが求められます。
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
              <Stethoscope className="w-10 h-10 md:w-12 md:h-12 mx-auto text-indigo-400 mb-4" />
              <div className="font-bold text-xl md:text-2xl text-gray-700">臨床応用</div>
              <div className="text-lg md:text-xl text-gray-500 mt-2">食事効果 (Food Effect) の予測</div>
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
          制作：間祐太朗（病院薬剤学研究室）
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