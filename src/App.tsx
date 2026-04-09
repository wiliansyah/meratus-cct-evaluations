import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  Upload, 
  Award, 
  TrendingUp, 
  TrendingDown, 
  BookOpen,
  Building2,
  Eye,
  EyeOff,
  Search,
  X,
  RefreshCw,
  Download,
  Save,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Filter,
  Users,
  BarChart3,
  Lock,
  Layers,
  TableProperties,
  Printer,
  Check,
  ChevronDown
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';

/**
 * FIREBASE CONFIGURATION
 */
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {
  apiKey: "AIzaSyCCiMYarDi_G2Q0jAFfJKfCgx4IMWvDkVw",
  authDomain: "meratus-cct-evaluations.firebaseapp.com",
  projectId: "meratus-cct-evaluations",
  storageBucket: "meratus-cct-evaluations.firebasestorage.app",
  messagingSenderId: "1084697450086",
  appId: "1:1084697450086:web:76da9e46cf0a136a92bfa7",
  measurementId: "G-X6JP3E4PVE"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'meratus-cct-evaluations';

const DEFAULT_TSV = `NO\tTraining Topic\tGroup SBU/SFU\tHead of SBU/SFU\tSME\tManager HRBP\tMeratus Academy\tAssessment Timeline\tUpdate CCT Module Timeline\tComprehensiveness of Theoretical Content HRBP\tComprehensiveness of Theoretical Content SME\tComprehensiveness of Theoretical Content ACADEMY\tComprehensiveness of Theoretical Content Average\tContent Accuracy & Validity HRBP\tContent Accuracy & Validity SME\tContent Accuracy & Validity ACADEMY\tContent Accuracy & Validity Average\tBusiness Relevance HRBP\tBusiness Relevance SME\tBusiness Relevance ACADEMY\tBusiness Relevance Average\tPractical Applicability HRBP\tPractical Applicability SME\tPractical Applicability ACADEMY\tPractical Applicability Average\tVisual & Slide Design HRBP\tVisual & Slide Design SME\tVisual & Slide Design ACADEMY\tVisual & Slide Design Average\tAlignment of Learning Evaluation HRBP\tAlignment of Learning Evaluation SME\tAlignment of Learning Evaluation ACADEMY\tAlignment of Learning Evaluation Average\tQuestions & Answer Options Quality HRBP\tQuestions & Answer Options Quality SME\tQuestions & Answer Options Quality ACADEMY\tQuestions & Answer Options Quality Average\tTotal Score\tFeedback for Improvement\tNew Participant Socre`;

const parseNum = (val) => {
  if (!val || val === '#DIV/0!' || val === '#N/A') return null;
  const num = parseFloat(val);
  return isNaN(num) ? null : num;
};

const resolveLink = (topic) => {
  return null;
}

const getHrbp = (row) => {
  if (!row) return '';
  if (row['Manager HRBP']) return row['Manager HRBP'];
  if (row['HRBP']) return row['HRBP'];
  const key = Object.keys(row).find(k => 
      k.toUpperCase().includes('HRBP') && 
      !k.toUpperCase().includes('COMPREHENSIVENESS') &&
      !k.toUpperCase().includes('ACCURACY') &&
      !k.toUpperCase().includes('RELEVANCE') &&
      !k.toUpperCase().includes('PRACTICAL') &&
      !k.toUpperCase().includes('VISUAL') &&
      !k.toUpperCase().includes('ALIGNMENT') &&
      !k.toUpperCase().includes('QUESTIONS')
  );
  return key ? row[key] : '';
};

const checkEvaluated = (row, roleString) => {
  const keys = Object.keys(row).filter(k => 
    k.toUpperCase().includes(roleString) && 
    !k.toUpperCase().includes('AVERAGE') &&
    (k.includes('Comprehensiveness') || k.includes('Accuracy') || k.includes('Relevance') ||
     k.includes('Practical') || k.includes('Visual') || k.includes('Alignment') || k.includes('Questions'))
  );
  return keys.some(k => parseNum(row[k]) !== null);
};

const MultiSelectDropdown = ({ label, options, selectedValues, onToggle, icon: Icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef} style={{ zIndex: isOpen ? 100 : 50 }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-bold uppercase rounded-lg px-3 py-2 flex items-center gap-2 hover:bg-slate-100 transition-all shadow-sm active:bg-slate-200"
      >
        <span className="opacity-60">{label}:</span> 
        <span className="text-slate-800">
          {selectedValues.length === 0 || selectedValues.includes('all') ? 'All' : `${selectedValues.length} Active`}
        </span>
        <ChevronDown size={12} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-2xl py-2 animate-in fade-in zoom-in-95 duration-100 ring-4 ring-slate-900/5">
          <div className="px-3 py-1 mb-1 border-b border-slate-50">
             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Select Filters</span>
          </div>
          {options.map((opt) => (
            <label key={opt.id} className="flex items-center px-4 py-2.5 hover:bg-blue-50 cursor-pointer group transition-colors">
              <div className={`w-4 h-4 border rounded flex items-center justify-center transition-all ${selectedValues.includes(opt.id) ? 'bg-blue-600 border-blue-600 shadow-sm' : 'border-slate-300 group-hover:border-blue-400'}`}>
                {selectedValues.includes(opt.id) && <Check size={10} className="text-white stroke-[4px]" />}
              </div>
              <input 
                type="checkbox" 
                className="hidden" 
                checked={selectedValues.includes(opt.id)}
                onChange={() => onToggle(opt.id)}
              />
              <span className={`ml-3 text-[10px] font-bold uppercase tracking-wider ${selectedValues.includes(opt.id) ? 'text-blue-700' : 'text-slate-600'}`}>
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

function useFilterDropdown(initialValue = "") {
  const [value, setValue] = useState(initialValue);
  return { value, setValue };
}

const GlobalSuggestionInput = ({ value, setValue, placeholder, list, icon: Icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-full sm:w-56 flex-shrink-0" ref={ref}>
      <div className="relative flex items-center group">
        <Icon className="absolute left-3.5 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
        <input 
          type="text" 
          placeholder={placeholder} 
          className="w-full pl-10 pr-8 py-2 bg-white border border-slate-200 shadow-sm rounded-full text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 placeholder:font-medium"
          value={value}
          onChange={(e) => { setValue(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          onClick={() => setIsOpen(true)}
        />
        {value && (
          <button type="button" onClick={() => setValue("")} className="absolute right-2 p-1 hover:bg-slate-100 rounded-full transition-colors z-10">
            <X size={12} className="text-slate-500" />
          </button>
        )}
      </div>
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-2">
          {list
            .filter(i => i.toLowerCase().includes(value.toLowerCase()))
            .slice(0, 30)
            .map((item, i) => (
              <button 
                key={i} 
                type="button"
                className="w-full text-left px-4 py-2.5 text-xs hover:bg-blue-50 text-slate-700 font-medium transition-colors border-b last:border-0 border-slate-100"
                onClick={(e) => { 
                  e.preventDefault(); 
                  setValue(item); 
                  setIsOpen(false); 
                }}
              >
                {item}
              </button>
            ))
          }
          {list.filter(i => i.toLowerCase().includes(value.toLowerCase())).length === 0 && (
             <div className="px-4 py-3 text-xs text-slate-400 font-medium italic text-center">No match found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('simplifikasi');
  const [tableView, setTableView] = useState('scored'); 

  const [scoreFilters, setScoreFilters] = useState(['all']); 
  const [evaluatorFilters, setEvaluatorFilters] = useState(['all']); 
  const [sortOrder, setSortOrder] = useState('none'); 
  
  const [rawData, setRawData] = useState(DEFAULT_TSV);
  const [selectedSBU, setSelectedSBU] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [user, setUser] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [syncError, setSyncError] = useState(null);

  const { value: topicFilter, setValue: setTopicFilter } = useFilterDropdown("");
  const { value: sbuFilter, setValue: setSbuFilter } = useFilterDropdown("");
  const { value: hrbpFilter, setValue: setHrbpFilter } = useFilterDropdown("");
  
  // NEW STATE: Filter untuk 100% SBU
  const [completeSbuOnly, setCompleteSbuOnly] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) { 
        setSyncError("Auth Fail"); 
        setIsLoadingData(false);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) setIsLoadingData(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'dashboard', 'tsv_data');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (typeof data.tsvData === 'string') {
          setRawData(data.tsvData);
        }
      }
      setIsLoadingData(false);
      setSyncError(null);
    }, (err) => {
      setSyncError("Sync Fail");
      setIsLoadingData(false);
    });
    return () => unsubscribe();
  }, [user]);

  const parsedData = useMemo(() => {
    if (!rawData || rawData.trim() === '') return []; 
    const lines = rawData.trim().split('\n');
    if (lines.length < 2) return [];
    const headers = lines[0].split('\t').map(h => h.trim());
    return lines.slice(1).map(line => {
      const values = line.split('\t');
      const obj = {};
      headers.forEach((header, i) => { obj[header] = values[i] ? values[i].trim() : ''; });
      
      obj._TotalScore = parseNum(obj['Total Score']);
      obj._Theory = parseNum(obj['Comprehensiveness of Theoretical Content Average']);
      obj._Accuracy = parseNum(obj['Content Accuracy & Validity Average']);
      obj._Relevance = parseNum(obj['Business Relevance Average']);
      obj._Practical = parseNum(obj['Practical Applicability Average']);
      obj._Visual = parseNum(obj['Visual & Slide Design Average']);
      obj._Eval = parseNum(obj['Alignment of Learning Evaluation Average']);
      obj._QA = parseNum(obj['Questions & Answer Options Quality Average']);
      
      obj._hasHRBP = checkEvaluated(obj, 'HRBP');
      obj._hasSME = checkEvaluated(obj, 'SME');
      obj._hasAcademy = checkEvaluated(obj, 'ACADEMY');

      return obj;
    });
  }, [rawData]);

  // NEW MEMO: Menghitung status completeness secara murni dari data sebelum filter aktif
  const sbuStats = useMemo(() => {
    const stats = {};
    parsedData.forEach(d => {
      const sbu = d['Group SBU/SFU'] || 'Unknown';
      if (!stats[sbu]) stats[sbu] = { total: 0, evaluated: 0 };
      stats[sbu].total += 1;
      if (d._TotalScore !== null) stats[sbu].evaluated += 1;
    });
    return stats;
  }, [parsedData]);

  const suggestions = useMemo(() => ({
    topics: [...new Set(parsedData.map(d => d['Training Topic']).filter(Boolean))].sort(),
    sbus: [...new Set(parsedData.map(d => d['Group SBU/SFU']).filter(Boolean))].sort(),
    hrbps: [...new Set(parsedData.map(d => getHrbp(d)).filter(h => h && h !== '-'))].sort()
  }), [parsedData]);

  const globallyFilteredData = useMemo(() => {
    let data = parsedData;
    
    // Terapkan SBU Complete Filter 
    if (completeSbuOnly) {
      data = data.filter(d => {
        const sbu = d['Group SBU/SFU'] || 'Unknown';
        return sbuStats[sbu] && sbuStats[sbu].total > 0 && sbuStats[sbu].total === sbuStats[sbu].evaluated;
      });
    }

    if (topicFilter) data = data.filter(d => (d['Training Topic'] || '').toLowerCase().includes(topicFilter.toLowerCase()));
    if (sbuFilter) data = data.filter(d => (d['Group SBU/SFU'] || '').toLowerCase().includes(sbuFilter.toLowerCase()));
    if (hrbpFilter) data = data.filter(d => getHrbp(d).toLowerCase().includes(hrbpFilter.toLowerCase()));
    
    return data;
  }, [parsedData, topicFilter, sbuFilter, hrbpFilter, completeSbuOnly, sbuStats]);

  const metrics = useMemo(() => {
    const data = globallyFilteredData;
    let scores = [];
    const sbuMap = {};
    const cat = { theory: [], accuracy: [], relevance: [], practical: [], visual: [], eval: [], qa: [] };
    
    let passCount = 0, refineCount = 0, pendingCount = 0;
    let hrbpCount = 0, smeCount = 0, acdCount = 0;

    data.forEach(d => {
      const sbu = d['Group SBU/SFU'] || 'Unknown';
      if (!sbuMap[sbu]) sbuMap[sbu] = { name: sbu, sum: 0, valid: 0, total: 0, modules: [] };
      sbuMap[sbu].total += 1;
      sbuMap[sbu].modules.push(d);
      
      if (d._TotalScore !== null) {
        scores.push({ topic: d['Training Topic'], score: d._TotalScore });
        sbuMap[sbu].sum += d._TotalScore;
        sbuMap[sbu].valid += 1;
        if (d._TotalScore >= 8) passCount++; else refineCount++;
      } else {
        pendingCount++;
      }

      if (d._Theory) cat.theory.push(d._Theory);
      if (d._Accuracy) cat.accuracy.push(d._Accuracy);
      if (d._Relevance) cat.relevance.push(d._Relevance);
      if (d._Practical) cat.practical.push(d._Practical);
      if (d._Visual) cat.visual.push(d._Visual);
      if (d._Eval) cat.eval.push(d._Eval);
      if (d._QA) cat.qa.push(d._QA);

      if (d._hasHRBP) hrbpCount++;
      if (d._hasSME) smeCount++;
      if (d._hasAcademy) acdCount++;
    });

    const getAvg = (arr) => arr.length ? (arr.reduce((a,b)=>a+b,0)/arr.length).toFixed(2) : "0";
    
    const sbuSummary = Object.values(sbuMap).map(s => ({
      ...s,
      avg: s.valid > 0 ? parseFloat((s.sum / s.valid).toFixed(2)) : 0,
      completeness: s.total > 0 ? ((s.valid / s.total) * 100).toFixed(1) : "0"
    })).sort((a,b) => b.avg - a.avg);

    scores.sort((a,b) => a.score - b.score);
    return {
      total: data.length, scored: scores.length, pending: pendingCount, pass: passCount, refine: refineCount,
      hrbpEvalCount: hrbpCount, smeEvalCount: smeCount, academyEvalCount: acdCount,
      completeness: data.length ? ((scores.length/data.length)*100).toFixed(1) : "0",
      avg: getAvg(scores.map(v => v.score)),
      highest: scores[scores.length-1], lowest: scores[0],
      sbuSummary,
      categories: [
        { name: "THEORY", val: getAvg(cat.theory) },
        { name: "ACCURACY", val: getAvg(cat.accuracy) },
        { name: "RELEVANCE", val: getAvg(cat.relevance) },
        { name: "PRACTICAL", val: getAvg(cat.practical) },
        { name: "VISUAL", val: getAvg(cat.visual) },
        { name: "EVALUATION", val: getAvg(cat.eval) },
        { name: "Q&A", val: getAvg(cat.qa) },
      ]
    };
  }, [globallyFilteredData]);

  const activeSBUs = metrics.sbuSummary.filter(s => s.valid > 0);
  const top5SBUs = activeSBUs.slice(0, 5);
  const otherSBUs = activeSBUs.slice(5);
  const zeroSBUs = metrics.sbuSummary.filter(s => s.valid === 0 && s.total > 0);

  const tableData = useMemo(() => {
    let baseData = globallyFilteredData;
    
    if (tableView === 'scored') baseData = baseData.filter(d => d._TotalScore !== null);
    else baseData = baseData.filter(d => d._TotalScore === null);

    if (!scoreFilters.includes('all')) {
      baseData = baseData.filter(d => {
        let matches = false;
        if (scoreFilters.includes('pass') && d._TotalScore >= 8) matches = true;
        if (scoreFilters.includes('refine') && d._TotalScore !== null && d._TotalScore < 8) matches = true;
        return matches;
      });
    }

    if (!evaluatorFilters.includes('all')) {
      baseData = baseData.filter(d => {
        return evaluatorFilters.every(f => {
          if (f === 'hrbp') return d._hasHRBP;
          if (f === 'sme') return d._hasSME;
          if (f === 'academy') return d._hasAcademy;
          if (f === 'all_completed') return d._hasHRBP && d._hasSME && d._hasAcademy;
          return true;
        });
      });
    }

    if (sortOrder === 'highest') {
      baseData = [...baseData].sort((a, b) => (b._TotalScore || 0) - (a._TotalScore || 0));
    } else if (sortOrder === 'lowest') {
      baseData = [...baseData].sort((a, b) => (a._TotalScore || 100) - (b._TotalScore || 100));
    }

    return baseData;
  }, [globallyFilteredData, tableView, scoreFilters, evaluatorFilters, sortOrder]);

  const handleToggleFilter = (id, current, setter) => {
    if (id === 'all') {
      setter(['all']);
    } else {
      let next = current.filter(item => item !== 'all');
      if (next.includes(id)) {
        next = next.filter(item => item !== id);
        if (next.length === 0) next = ['all'];
      } else {
        next.push(id);
      }
      setter(next);
    }
  };

  const handleSaveToCloud = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'dashboard', 'tsv_data');
      await setDoc(docRef, { tsvData: rawData, updatedAt: new Date().toISOString(), updatedBy: user.uid });
      setActiveTab('simplifikasi');
    } catch (e) { setSyncError("Save Failed"); }
    finally { setIsSaving(false); }
  };

  const handleExportTable = () => {
    const b = new Blob([rawData], { type: 'text/tsv' }); 
    const u = URL.createObjectURL(b); 
    const a = document.createElement('a'); 
    a.href = u; 
    a.download = 'Meratus_CCT_Export.tsv'; 
    a.click();
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('pdf-one-pager');
    if (!element) return;
    setIsDownloading(true);
    const originalCssText = element.style.cssText;
    
    element.style.width = '1120px';
    element.style.minWidth = '1120px';
    element.style.maxWidth = '1120px';
    element.style.margin = '0 auto';

    const opt = {
      margin:       0.2, 
      filename:     'Meratus_CCT_OnePager.pdf',
      image:        { type: 'jpeg', quality: 1 },
      html2canvas:  { 
        scale: 2, 
        useCORS: true, 
        logging: false, 
        windowWidth: 1120,
        x: 0,
        y: 0
      },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'landscape' }
    };

    const cleanup = () => {
      element.style.cssText = originalCssText;
      setIsDownloading(false);
    };

    if (!window.html2pdf) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      script.onload = () => {
        window.html2pdf().set(opt).from(element).save().then(cleanup).catch(cleanup);
      };
      document.head.appendChild(script);
    } else {
      window.html2pdf().set(opt).from(element).save().then(cleanup).catch(cleanup);
    }
  };

  const isAnyFilterActive = topicFilter || sbuFilter || hrbpFilter || completeSbuOnly;
  const clearAllFilters = () => { 
    setTopicFilter(""); 
    setSbuFilter(""); 
    setHrbpFilter(""); 
    setCompleteSbuOnly(false); 
  };

  const getSubScoreStyle = (score) => {
    if (!score || score === '-') return 'bg-slate-50/30 text-slate-600';
    const num = parseFloat(score);
    return num < 8 
      ? 'bg-red-50 text-red-600 font-bold border-x border-red-100' 
      : 'bg-slate-50/30 text-slate-600';
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans selection:bg-blue-200 selection:text-blue-900">
      
      {/* HEADER NAVBAR */}
      <nav className="bg-[#0F172A] text-white shadow-lg sticky top-0 z-50 border-b border-white/5 print:hidden">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-3 md:py-0 md:h-[72px]">
            <div className="flex items-center gap-4 flex-shrink-0">
              <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-2.5 rounded-xl shadow-lg shadow-blue-500/20">
                <Award className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <h1 className="font-bold text-sm tracking-wide uppercase leading-tight text-white">Meratus Academy: CCT Evaluations</h1>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${syncError ? 'bg-rose-500' : 'bg-emerald-400 animate-pulse'}`}></div>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{syncError || 'Cloud Sync Active'}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="flex bg-slate-800/80 p-1.5 rounded-xl shadow-inner border border-white/10 backdrop-blur-sm overflow-x-auto">
                <button 
                  onClick={() => setActiveTab('simplifikasi')} 
                  className={`px-4 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${activeTab === 'simplifikasi' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}
                >
                  <LayoutDashboard size={14}/> Simplified View
                </button>
                <button 
                  onClick={() => setActiveTab('detail')} 
                  className={`px-4 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${activeTab === 'detail' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}
                >
                  <TableProperties size={14}/> Detail View
                </button>
                <button 
                  onClick={() => setActiveTab('source')} 
                  className={`px-4 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${activeTab === 'source' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}
                >
                  <Upload size={14}/> Source Data
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* GLOBAL FILTERS BAR */}
      {(activeTab === 'simplifikasi' || activeTab === 'detail') && (
        <div className="bg-white border-b border-slate-200 shadow-sm sticky top-[72px] z-40 print:hidden">
           <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 mr-1">
                 <Filter size={14} className="text-blue-600" />
                 <span className="text-[11px] font-bold uppercase tracking-widest text-slate-600">Global Filter:</span>
              </div>
              <GlobalSuggestionInput value={topicFilter} setValue={setTopicFilter} placeholder="Search Training Topic..." list={suggestions.topics} icon={Search} />
              <GlobalSuggestionInput value={sbuFilter} setValue={setSbuFilter} placeholder="Filter SBU/SFU..." list={suggestions.sbus} icon={Building2} />
              <GlobalSuggestionInput value={hrbpFilter} setValue={setHrbpFilter} placeholder="Filter HRBP..." list={suggestions.hrbps} icon={Users} />
              
              {/* NEW TOGGLE BUTTON: SBU/SFU 100% COMPLETE */}
              <button 
                onClick={() => setCompleteSbuOnly(!completeSbuOnly)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors border ${completeSbuOnly ? 'bg-emerald-100 text-emerald-700 border-emerald-200 shadow-inner' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 shadow-sm'}`}
              >
                <CheckCircle2 size={12} className={completeSbuOnly ? 'text-emerald-600' : 'text-slate-400'} />
                100% Complete SBU
              </button>

              {isAnyFilterActive && (
                <button 
                  onClick={clearAllFilters}
                  className="text-[10px] font-bold text-rose-500 hover:text-white bg-rose-50 hover:bg-rose-500 px-3 py-1.5 rounded-full flex items-center gap-1.5 uppercase tracking-widest transition-colors border border-rose-100 shadow-sm"
                >
                  <X size={12} /> Clear
                </button>
              )}

              {activeTab === 'simplifikasi' && (
                <button 
                  onClick={handleDownloadPDF}
                  disabled={isDownloading}
                  className="ml-auto text-[11px] font-bold text-white bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-full flex items-center gap-2 uppercase tracking-widest transition-all shadow-md active:scale-95 disabled:opacity-50"
                >
                  {isDownloading ? <RefreshCw size={14} className="animate-spin" /> : <Printer size={14} />}
                  {isDownloading ? 'Processing...' : 'Download PDF'}
                </button>
              )}
           </div>
        </div>
      )}

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-4">
        {isLoadingData ? (
          <div className="h-[70vh] flex flex-col items-center justify-center text-slate-400 animate-in fade-in duration-500 print:hidden">
            <RefreshCw className="h-10 w-10 animate-spin mb-4 text-blue-500" />
            <p className="font-semibold text-xs tracking-widest uppercase animate-pulse">Loading Data...</p>
          </div>
        ) : activeTab === 'simplifikasi' ? (
          <div id="pdf-one-pager" className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500 bg-[#F8FAFC]">
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden h-[100px]">
                <div className="absolute top-3 right-3 text-slate-100 bg-slate-50 rounded-full p-1.5 border border-slate-100"><CheckCircle2 size={24} className="text-slate-200" /></div>
                <p className="text-[9px] font-bold text-blue-500 uppercase tracking-widest flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> 1. COMPLETENESS</p>
                <h3 className="text-3xl font-black text-slate-800 tracking-tighter relative z-10">{metrics.completeness}%</h3>
                <div className="w-2/3 bg-slate-100 h-1.5 rounded-full overflow-hidden relative z-10 mt-auto">
                  <div className="bg-blue-600 h-full" style={{ width: metrics.completeness + '%' }}></div>
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden h-[100px]">
                <div className="absolute top-3 right-3 text-slate-100 bg-slate-50 rounded-lg p-1.5 border border-slate-100"><BarChart3 size={24} className="text-slate-200" /></div>
                <p className={`text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${parseFloat(metrics.avg) < 8 ? 'text-red-500' : 'text-emerald-500'}`}><span className={`w-1.5 h-1.5 rounded-full ${parseFloat(metrics.avg) < 8 ? 'bg-red-500' : 'bg-emerald-500'}`}></span> 2. GLOBAL AVERAGE</p>
                <h3 className={`text-3xl font-black tracking-tighter relative z-10 ${parseFloat(metrics.avg) < 8 ? 'text-red-600' : 'text-emerald-600'}`}>{metrics.avg}</h3>
                <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest relative z-10 border-t border-slate-100 pt-1.5 mt-auto">AVERAGE MODULE SCORE</p>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between h-[100px]">
                <div className="flex justify-between items-start">
                   <p className="text-[9px] font-bold text-blue-600 uppercase tracking-widest flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span> 3. HIGHEST SCORE</p>
                   <span className="text-xl font-black text-slate-800 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-100">{metrics.highest?.score || '-'}</span>
                </div>
                <div className="mt-2 border-t border-slate-100 pt-2 flex-1 flex items-end">
                  <p className="text-[10px] text-slate-600 font-bold leading-tight line-clamp-2" title={metrics.highest?.topic}>
                    {metrics.highest?.topic || '-'}
                  </p>
                </div>
              </div>

              <div className={`bg-white p-3.5 rounded-xl border shadow-sm flex flex-col justify-between h-[100px] ${metrics.lowest?.score < 8 ? 'border-red-200 bg-red-50/20' : 'border-slate-200'}`}>
                <div className="flex justify-between items-start">
                  <p className={`text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${metrics.lowest?.score < 8 ? 'text-red-600' : 'text-rose-600'}`}><span className={`w-1.5 h-1.5 rounded-full ${metrics.lowest?.score < 8 ? 'bg-red-600' : 'bg-rose-600'}`}></span> 4. LOWEST SCORE</p>
                  <span className={`text-xl font-black px-2.5 py-0.5 rounded border ${metrics.lowest?.score < 8 ? 'text-white bg-red-500 border-red-600' : 'text-slate-800 bg-rose-50 border-rose-100'}`}>{metrics.lowest?.score || '-'}</span>
                </div>
                <div className={`mt-2 border-t pt-2 flex-1 flex items-end ${metrics.lowest?.score < 8 ? 'border-red-100' : 'border-slate-100'}`}>
                  <p className="text-[10px] text-slate-600 font-bold leading-tight line-clamp-2" title={metrics.lowest?.topic}>
                    {metrics.lowest?.topic || '-'}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
               <div className="bg-emerald-50/50 border border-emerald-100/60 px-4 py-2 rounded-xl flex items-center justify-between shadow-sm h-[64px]">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider leading-none">5. PASS MODULE</span>
                    <span className="text-[8px] font-bold text-emerald-500 uppercase mt-1.5 leading-none">SCORE &ge; 8.0</span>
                  </div>
                  <span className="text-xl font-black text-emerald-700 leading-none">{metrics.pass}</span>
               </div>
               <div className="bg-red-50/80 border border-red-200/60 px-4 py-2 rounded-xl flex items-center justify-between shadow-sm h-[64px]">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-red-800 uppercase tracking-wider leading-none">6. REFINED MODULE</span>
                    <span className="text-[8px] font-bold text-red-500 uppercase mt-1.5 leading-none">SCORE &lt; 8.0</span>
                  </div>
                  <span className="text-xl font-black text-red-700 leading-none">{metrics.refine}</span>
               </div>
               <div className="bg-amber-50/50 border border-amber-100/60 px-4 py-2 rounded-xl flex items-center justify-between shadow-sm h-[64px]">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider leading-none">7. PENDING REVIEW</span>
                    <span className="text-[8px] font-bold text-amber-500 uppercase mt-1.5 leading-none">NOT YET EVALUATED</span>
                  </div>
                  <span className="text-xl font-black text-amber-700 leading-none">{metrics.pending}</span>
               </div>
               <div className="bg-blue-50 border border-blue-200 px-4 py-2 rounded-xl flex flex-col justify-center shadow-sm h-[64px] gap-1">
                 <div className="flex justify-between items-center w-full">
                   <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider leading-none">8. TOTAL EVALUATED</span>
                      <span className="text-[8px] font-bold text-blue-500 uppercase mt-1 leading-none">FROM {metrics.total} MODULES</span>
                   </div>
                   <span className="text-xl font-black text-blue-700 leading-none">{metrics.scored}</span>
                 </div>
                 <div className="flex justify-between items-center text-[8px] font-bold text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded mt-0.5 border border-blue-200">
                    <span className="flex items-center gap-1" title="Evaluated by HRBP">HRBP <span className="text-blue-900">{metrics.hrbpEvalCount}</span></span>
                    <span className="flex items-center gap-1" title="Evaluated by SME">SME <span className="text-blue-900">{metrics.smeEvalCount}</span></span>
                    <span className="flex items-center gap-1" title="Evaluated by Academy">ACD <span className="text-blue-900">{metrics.academyEvalCount}</span></span>
                 </div>
               </div>
            </div>

            <div className="grid grid-cols-12 gap-3 items-stretch flex-1">
              <div className="col-span-12 lg:col-span-3 bg-[#0F172A] rounded-xl p-4 shadow-md flex flex-col border border-slate-800 h-full">
                  <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-2">
                    <BookOpen size={14} className="text-white" />
                    <h3 className="text-[10px] font-bold tracking-widest uppercase text-white">9. CATEGORY PERFORMANCE</h3>
                  </div>
                  <div className="space-y-3 flex-1 flex flex-col justify-center">
                    {metrics.categories.map((cat, i) => (
                      <div key={i}>
                        <div className="flex justify-between items-end mb-1">
                          <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest leading-none">{cat.name}</span>
                          <span className={`text-[10px] font-black leading-none ${parseFloat(cat.val) < 8 ? 'text-red-400' : 'text-amber-400'}`}>{cat.val}</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${parseFloat(cat.val) < 8 ? 'bg-red-500' : 'bg-amber-400'}`} style={{ width: (parseFloat(cat.val) * 10) + '%' }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
              </div>

              <div className="col-span-12 lg:col-span-9 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
                  <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="bg-blue-50 p-1.5 rounded-lg border border-blue-100"><Building2 className="text-blue-600 h-3.5 w-3.5" /></div>
                      <h2 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">10. PERFORMANCE & PROGRESS PER SBU/SFU UNIT</h2>
                    </div>
                    <span className="text-[9px] text-slate-500 font-bold bg-white px-2 py-0.5 rounded-full border border-slate-200">{metrics.sbuSummary.length} Total Units</span>
                  </div>
                  
                  <div className="p-3 flex-1 flex flex-col bg-slate-50/30">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mb-3">
                      {top5SBUs.map((s, i) => (
                        <div key={`top-${i}`} className={`bg-white border rounded-lg p-2.5 pl-3 flex flex-col relative overflow-hidden shadow-sm h-[60px] justify-between ${s.avg < 8 ? 'border-red-200' : 'border-slate-200'}`}>
                          <div className={`absolute top-0 left-0 w-1 h-full ${s.avg >= 8 ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                          <div className="flex justify-between items-start w-full gap-1">
                            <span className="text-[9px] font-bold text-slate-600 uppercase leading-none truncate flex-1" title={s.name}>{s.name}</span>
                            <span className="text-[8px] font-bold text-slate-400 leading-none">{s.completeness}%</span>
                          </div>
                          <div className="flex items-end justify-between mt-auto w-full">
                            <span className={`text-base font-black leading-none ${s.avg >= 8 ? 'text-emerald-600' : 'text-red-600'}`}>{s.avg}</span>
                            <div className="w-10 bg-slate-100 h-1 rounded-full overflow-hidden mb-0.5">
                              <div className="bg-blue-500 h-full" style={{ width: s.completeness + '%' }}></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {otherSBUs.length > 0 && (
                      <div className="mb-3 border-b border-slate-100 pb-3">
                         <div className="flex items-center gap-1.5 mb-1.5">
                           <BarChart3 className="text-slate-400" size={12}/>
                           <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">OTHER UNITS</span>
                         </div>
                         <div className="flex flex-wrap gap-1.5">
                           {otherSBUs.map((s, idx) => (
                             <div key={`other-${idx}`} className={`text-[9px] font-bold bg-white px-2 py-1 rounded border flex items-center gap-1.5 shadow-sm ${s.avg < 8 ? 'border-red-200 bg-red-50/30' : 'border-slate-200 text-slate-600'}`}>
                                <span className={`max-w-[120px] truncate ${s.avg < 8 ? 'text-red-700' : 'text-slate-600'}`} title={s.name}>{s.name}</span>
                                <div className={`h-3 w-px mx-0.5 ${s.avg < 8 ? 'bg-red-200' : 'bg-slate-200'}`}></div>
                                <span className={`font-black ${s.avg >= 8 ? 'text-emerald-600' : 'text-red-600'}`}>{s.avg}</span>
                                <span className="text-[8px] text-slate-400 font-semibold">({s.completeness}%)</span>
                             </div>
                           ))}
                         </div>
                      </div>
                    )}

                    {zeroSBUs.length > 0 && (
                      <div className="mt-auto bg-slate-50 border border-slate-200 border-dashed rounded-lg p-2">
                         <div className="flex items-center gap-1.5 mb-1.5">
                           <Layers className="text-slate-400" size={12}/>
                           <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">NO EVALUATION YET (PENDING)</span>
                         </div>
                         <div className="flex flex-wrap gap-1.5">
                           {zeroSBUs.map((s, idx) => (
                             <div key={`zero-${idx}`} className="text-[8px] font-bold text-slate-500 bg-white px-1.5 py-1 rounded border border-slate-200 flex items-center gap-1 shadow-sm">
                                {s.name} <span className="bg-slate-100 text-slate-400 px-1 py-0.5 rounded-sm">{s.total}</span>
                             </div>
                           ))}
                         </div>
                      </div>
                    )}
                  </div>
              </div>
            </div>
          </div>

        ) : activeTab === 'detail' ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <section className="bg-white rounded-[2rem] border border-slate-200 shadow-sm flex flex-col mb-10 overflow-visible">
              <div className="flex flex-col md:flex-row border-b border-slate-200 bg-white rounded-t-[2rem] overflow-visible">
                <div className="flex overflow-x-auto no-scrollbar flex-1">
                  <button 
                    onClick={() => setTableView('scored')} 
                    className={`px-8 py-5 text-xs font-bold uppercase tracking-widest transition-all border-b-4 whitespace-nowrap ${tableView === 'scored' ? 'border-blue-600 text-blue-700 bg-slate-50/50 shadow-sm' : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
                  >
                    Evaluated ({metrics.scored})
                  </button>
                  <button 
                    onClick={() => setTableView('unscored')} 
                    className={`px-8 py-5 text-xs font-bold uppercase tracking-widest transition-all border-b-4 whitespace-nowrap ${tableView === 'unscored' ? 'border-amber-500 text-amber-700 bg-slate-50/50 shadow-sm' : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
                  >
                    Pending Review ({metrics.pending})
                  </button>
                </div>
                
                <div className="flex flex-wrap items-center px-4 py-3 md:py-0 border-t md:border-t-0 border-slate-200 gap-3 bg-white z-10 w-full md:w-auto overflow-visible">
                  <div className="flex items-center gap-2 mr-2 border-r border-slate-200 pr-4 overflow-visible">
                    <MultiSelectDropdown 
                      label="Score"
                      options={[
                        {id: 'all', label: 'All Score'},
                        {id: 'pass', label: 'Score ≥ 8'},
                        {id: 'refine', label: 'Score < 8'}
                      ]}
                      selectedValues={scoreFilters}
                      onToggle={(id) => handleToggleFilter(id, scoreFilters, setScoreFilters)}
                    />

                    <MultiSelectDropdown 
                      label="Evaluator"
                      options={[
                        {id: 'all', label: 'All Evaluators'},
                        {id: 'hrbp', label: 'Has HRBP Score'},
                        {id: 'sme', label: 'Has SME Score'},
                        {id: 'academy', label: 'Has Academy Score'},
                        {id: 'all_completed', label: 'All Roles Completed'}
                      ]}
                      selectedValues={evaluatorFilters}
                      onToggle={(id) => handleToggleFilter(id, evaluatorFilters, setEvaluatorFilters)}
                    />

                    <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-bold uppercase rounded-lg px-2 py-2 outline-none focus:ring-2 focus:ring-blue-500 h-[34px]">
                      <option value="none">Sort: Default</option>
                      <option value="highest">Highest Score</option>
                      <option value="lowest">Lowest Score</option>
                    </select>
                  </div>

                  <button 
                    onClick={handleExportTable} 
                    className="text-[11px] font-bold text-white bg-slate-800 hover:bg-slate-700 flex items-center gap-2 uppercase tracking-widest transition-all px-4 py-2 rounded-xl shadow-sm"
                  >
                    <Download size={14}/> Export Data
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto overflow-y-auto w-full custom-scrollbar max-h-[65vh] relative bg-white rounded-b-[2rem]" style={{ zIndex: 1 }}>
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 z-20 bg-slate-100 shadow-sm ring-1 ring-slate-200/50 backdrop-blur-sm">
                    <tr className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="px-6 py-4 whitespace-nowrap">No</th>
                      <th className="px-6 py-4 min-w-[250px] w-1/3">Training Topic</th>
                      <th className="px-6 py-4 whitespace-nowrap">Group SBU</th>
                      <th className="px-6 py-4 whitespace-nowrap">HRBP Name</th>
                      <th className="px-6 py-4 whitespace-nowrap text-center bg-slate-200/30">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tableData.map((row, idx) => {
                      const topicLink = resolveLink(row['Training Topic']);
                      return (
                        <tr key={idx} className="even:bg-slate-50/50 hover:bg-blue-50/60 transition-colors group">
                          <td className="px-6 py-4 text-xs font-semibold text-slate-400 whitespace-nowrap">{row['NO'] || '-'}</td>
                          <td className="px-6 py-4">
                             {topicLink ? (
                               <a 
                                 href={topicLink} target="_blank" rel="noopener noreferrer" 
                                 className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline line-clamp-2 transition-colors" title={row['Training Topic']}
                               >
                                  {row['Training Topic'] || '-'}
                               </a>
                             ) : (
                               <div className="text-xs font-bold text-slate-800 line-clamp-2" title={row['Training Topic']}>
                                  {row['Training Topic'] || '-'}
                               </div>
                             )}
                          </td>
                          <td className="px-6 py-4 text-xs font-semibold text-slate-600 whitespace-nowrap">{row['Group SBU/SFU'] || '-'}</td>
                          <td className="px-6 py-4 text-xs font-semibold text-slate-600 whitespace-nowrap">{getHrbp(row) || '-'}</td>
                          <td className="px-6 py-4 text-center">
                             {row._TotalScore !== null ? (
                               <span className={`inline-flex items-center justify-center px-3.5 py-1.5 rounded-full text-xs font-black shadow-sm border ${row._TotalScore >= 8 ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-red-500 text-white border-red-600'}`}>
                                 {row._TotalScore}
                               </span>
                             ) : (
                               <span className="inline-flex items-center justify-center px-3 py-1.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200 uppercase tracking-widest shadow-sm">
                                 Pending
                               </span>
                             )}
                          </td>
                        </tr>
                      )
                    })}
                    {tableData.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-20 text-center text-slate-400 bg-slate-50/50">
                          <div className="flex flex-col items-center justify-center gap-4">
                            <div className="bg-white p-4 rounded-full shadow-sm border border-slate-100">
                               <AlertCircle size={32} className="text-slate-300" />
                            </div>
                            <div>
                               <p className="text-sm font-bold text-slate-600">No data found</p>
                               <p className="text-xs font-semibold text-slate-400 mt-1">Adjust the filter keywords above.</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

        ) : (
          <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                {!isAuthorized ? (
                  <div className="p-12 flex flex-col items-center justify-center text-center py-24 bg-slate-50/50">
                     <div className="bg-slate-200/50 p-5 rounded-full mb-6 border border-slate-200 shadow-inner">
                       <Lock size={36} className="text-slate-500" />
                     </div>
                     <h2 className="text-xl font-black text-slate-800 mb-2 tracking-tight">Access Locked</h2>
                     <p className="text-sm font-semibold text-slate-500 mb-8 max-w-sm">Enter administration password to update raw data (TSV).</p>
                     
                     <div className="flex w-full max-w-sm gap-3">
                        <div className="relative flex-1">
                           <input 
                             type={showPassword ? 'text' : 'password'}
                             value={passwordInput}
                             onChange={e => setPasswordInput(e.target.value)}
                             onKeyDown={e => { 
                               if(e.key === 'Enter') {
                                 if (passwordInput === 'MeratusAcademy') setIsAuthorized(true);
                                 else alert("Incorrect Password!");
                               }
                             }}
                             placeholder="Enter Password..."
                             className="w-full bg-white border border-slate-300 px-4 py-3 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none pr-10 shadow-sm"
                           />
                           <button 
                             onClick={() => setShowPassword(!showPassword)} 
                             className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                           >
                              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                           </button>
                        </div>
                        <button 
                          onClick={() => { 
                            if(passwordInput === 'MeratusAcademy') setIsAuthorized(true); 
                            else alert("Incorrect Password!");
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-md shadow-blue-500/20 transition-all active:scale-95"
                        >
                          Unlock
                        </button>
                     </div>
                  </div>
                ) : (
                  <>
                    <div className="px-8 py-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                       <div className="flex items-center gap-3">
                         <div className="bg-indigo-100 p-2.5 rounded-xl text-indigo-600"><FileSpreadsheet size={20} /></div>
                         <div>
                           <h2 className="text-base font-bold text-slate-800">Data Source (TSV)</h2>
                           <p className="text-xs font-semibold text-slate-500 mt-0.5">Paste raw TSV data from spreadsheet here</p>
                         </div>
                       </div>
                       <button 
                         onClick={handleSaveToCloud}
                         disabled={isSaving}
                         className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-70 active:scale-95"
                       >
                         {isSaving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                         {isSaving ? 'Saving...' : 'Save & Update'}
                       </button>
                    </div>
                    <div className="p-6 bg-slate-50/30">
                      <textarea 
                        value={rawData}
                        onChange={(e) => setRawData(e.target.value)}
                        className="w-full h-[60vh] bg-white border border-slate-200 shadow-inner rounded-xl p-4 text-[11px] font-mono text-slate-700 focus:ring-4 focus:ring-indigo-100 outline-none resize-none custom-scrollbar whitespace-pre"
                        spellCheck="false"
                      ></textarea>
                    </div>
                  </>
                )}
             </div>
          </div>
        )}
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @media print {
           @page { size: A4 landscape; margin: 10mm; }
           body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background-color: white !important; }
        }
      `}} />
    </div>
  );
}