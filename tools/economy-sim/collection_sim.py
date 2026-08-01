import numpy as np, math

rng_master = np.random.default_rng(42)

# ---------- Exact-ish expected eggs (coupon collector, unequal probs, NO pity) ----------
def ET(groups, tmax=120000, n=1200001):
    t = np.linspace(1e-9, tmax, n)
    s = np.zeros_like(t)
    for p, c in groups:
        s += c * np.log1p(-np.exp(-p * t))
    integrand = 1.0 - np.exp(s)
    return np.trapezoid(integrand, t)

H = lambda m: sum(1.0/i for i in range(1, m+1))

# v1 rates
v1 = [(0.55/120,120),(0.25/90,90),(0.14/60,60),(0.045/20,20),(0.015/10,10)]
# v2 rates (300 album, gizli separate)
v2_300 = [(0.55/120,120),(0.25/90,90),(0.14/60,60),(0.046/20,20),(0.009/10,10)]
v2_310 = v2_300 + [(0.005/10,10)]

print("Uniform-300 baseline: %.0f" % (300*(math.log(300)+0.5772)+0.5))
print("E[T] v1 (no pity, 300): %.0f" % ET(v1))
print("E[T] v2 (no pity, 300): %.0f" % ET(v2_300))
print("E[T] v2 (no pity, 310 incl gizli): %.0f" % ET(v2_310, tmax=300000, n=1500001))

# single family, targeted eggs, no pity
fam = [(0.55/12,12),(0.25/9,9),(0.14/6,6),(0.046/2,2),(0.009,1)]
print("E[T] one family targeted (no pity, 30): %.0f" % ET(fam, tmax=30000, n=600001))

# ---------- Monte Carlo v2 with pity + smart drop + craft ----------
# tiers: 0 Yaygin,1 AzBulunur,2 Nadir,3 Destansi,4 Efsanevi,5 Gizli
BASE = np.array([0.55, 0.25, 0.14, 0.046, 0.009, 0.005])
COUNTS = [120, 90, 60, 20, 10, 10]
DUPE_KABUK  = [1, 2, 4, 10, 25, 60]
CRAFT_COST  = [5, 10, 25, 80, 200, 300]
N_FAM = 10; FAM_SIZE = 31  # 30 album + 1 gizli per family
# piece index: fam*31 + slot ; slots 0-11 yaygin,12-20 az,21-26 nadir,27-28 destansi,29 efsanevi,30 gizli
TIER_OF = np.zeros(310, dtype=int)
FAM_OF  = np.zeros(310, dtype=int)
for f in range(10):
    for s in range(31):
        i = f*31+s
        FAM_OF[i]=f
        TIER_OF[i] = 0 if s<12 else 1 if s<21 else 2 if s<27 else 3 if s<29 else 4 if s==30-1 else 5
# fix: slot 29 efsanevi, slot 30 gizli
for f in range(10):
    TIER_OF[f*31+29]=4; TIER_OF[f*31+30]=5
PIECES_BY_TIER = [np.where(TIER_OF==k)[0] for k in range(6)]

SOFT_START, SOFT_STEP, HARD_E = 70, 0.06, 100
PITY_D, PITY_N = 40, 15
DUP_STREAK_BREAK = 6
CRAFT_CAP_WEEK = 5
W_MISS_BASE = 4.0   # eksik parca agirligi (her zaman)
W_MISS_END  = 12.0  # aile>=27/30 veya album>=270 iken

def simulate(weekly_eggs, runs=400, seed=1, target=300, max_days=2000):
    rng = np.random.default_rng(seed)
    days_done = []
    eggs_done = []
    per_day = weekly_eggs/7.0
    for r in range(runs):
        owned = np.zeros(310, dtype=bool)
        kabuk = 0.0; n_ctr=d_ctr=e_ctr=0; dup_streak=0
        ms_paid = [set() for _ in range(10)]  # milestone kabuk grants
        eggs=0; day=0; crafted_this_week=0
        album = 0  # count of owned among non-gizli
        fam_cnt = np.zeros(10, dtype=int)  # album pieces per family (max 30)
        egg_budget = 0.0
        done_day=None; done_eggs=None
        while day < max_days:
            day += 1
            if day % 7 == 1:
                crafted_this_week = 0
                kabuk += 25  # haftalik gorev geliri (hacimden bagimsiz)
            egg_budget += per_day
            while egg_budget >= 1.0:
                egg_budget -= 1.0; eggs += 1
                # --- tier roll with pity ---
                if e_ctr >= HARD_E-1:
                    tier = 4
                else:
                    w = BASE.copy()
                    if e_ctr >= SOFT_START-1:
                        boost = min(0.95, BASE[4] + SOFT_STEP*(e_ctr-(SOFT_START-1)+1))
                        w[4] = boost
                        w[:4] *= (1-w[4]-w[5])/w[:4].sum()
                    u = rng.random()
                    c = np.cumsum(w/w.sum()); tier = int(np.searchsorted(c,u))
                    if d_ctr >= PITY_D-1 and tier < 3: tier = 3
                    elif n_ctr >= PITY_N-1 and tier < 2: tier = 2
                # --- piece selection (smart) ---
                pool = PIECES_BY_TIER[tier]
                miss = pool[~owned[pool]]
                force_missing = (dup_streak >= DUP_STREAK_BREAK) and len(miss)>0
                pw = np.ones(len(pool))
                for j,p in enumerate(pool):
                    if not owned[p]:
                        pw[j]=W_MISS_END if (fam_cnt[FAM_OF[p]]>=27 or album>=270) else W_MISS_BASE
                if tier>=4 and len(miss)>0:  # smart pity: efsanevi/gizli always missing-first
                    sel = miss[rng.integers(len(miss))]
                elif force_missing:
                    sel = miss[rng.integers(len(miss))]
                else:
                    pw/=pw.sum(); sel = pool[int(np.searchsorted(np.cumsum(pw),rng.random()))]
                # --- resolve ---
                if owned[sel]:
                    kabuk += DUPE_KABUK[TIER_OF[sel]]; dup_streak+=1
                else:
                    owned[sel]=True; dup_streak=0
                    if TIER_OF[sel]<5:
                        album+=1; f=FAM_OF[sel]; fam_cnt[f]+=1
                        for th,gr in ((10,15),(20,30),(27,60),(30,100)):
                            if fam_cnt[f]>=th and th not in ms_paid[f]:
                                ms_paid[f].add(th); kabuk+=gr
                # counters
                if tier>=2: n_ctr=0
                else: n_ctr+=1
                if tier>=3: d_ctr=0
                else: d_ctr+=1
                if tier>=4: e_ctr=0
                else: e_ctr+=1
                if album>=target: break
            # --- craft (daily check, weekly cap) ---
            while crafted_this_week < CRAFT_CAP_WEEK or album >= 290:
                cands=[p for p in range(310) if not owned[p] and TIER_OF[p]<5
                       and (fam_cnt[FAM_OF[p]]>=24 or album>=260)]
                if not cands: break
                cands.sort(key=lambda p:-CRAFT_COST[TIER_OF[p]])
                p=cands[0]
                if kabuk>=CRAFT_COST[TIER_OF[p]]:
                    kabuk-=CRAFT_COST[TIER_OF[p]]; owned[p]=True
                    album+=1; f=FAM_OF[p]; fam_cnt[f]+=1; crafted_this_week+=1
                    for th,gr in ((10,15),(20,30),(27,60),(30,100)):
                        if fam_cnt[f]>=th and th not in ms_paid[f]:
                            ms_paid[f].add(th); kabuk+=gr
                else: break
            if album>=target:
                done_day=day; done_eggs=eggs; break
        days_done.append(done_day if done_day else max_days)
        eggs_done.append(done_eggs if done_eggs else eggs)
    d=np.array(days_done); e=np.array(eggs_done)
    return (np.percentile(d,10),np.median(d),np.percentile(d,90),
            np.percentile(e,10),np.median(e),np.percentile(e,90))

print("\nweekly | days P10/med/P90 | eggs P10/med/P90  (album 300, pity+smart+craft)")
for wk in [28,35,50,100,200]:
    res = simulate(wk, runs=400, seed=wk)
    print(f"{wk:>6} | {res[0]:5.0f} {res[1]:5.0f} {res[2]:5.0f} | {res[3]:5.0f} {res[4]:5.0f} {res[5]:5.0f}")

# consolidated efsanevi rate check (soft+hard pity, base 0.9%)
def consolidated(runs=200000, seed=3):
    rng=np.random.default_rng(seed); tot=0; cnt=0; e=0
    for _ in range(runs):
        e+=1
        p = 1.0 if e>=HARD_E else (BASE[4] if e<SOFT_START else min(0.95,BASE[4]+SOFT_STEP*(e-SOFT_START+1)))
        if rng.random()<p: cnt+=1; tot+=e; e=0
    return (tot/cnt if cnt else 0, cnt/runs)
avg_gap, rate = consolidated()
print(f"\nEfsanevi consolidated: ort. {avg_gap:.1f} yumurtada 1 (etkin oran %{100*rate:.2f})")

# ---------- single family targeted eggs, with pity+smart (family unit) ----------
def sim_family(runs=2000, seed=9):
    rng=np.random.default_rng(seed)
    # 30 pieces: 12/9/6/2/1 tiers 0..4 (gizli haric)
    tier_of=np.array([0]*12+[1]*9+[2]*6+[3]*2+[4])
    by_tier=[np.where(tier_of==k)[0] for k in range(5)]
    base=np.array([0.55,0.25,0.14,0.046,0.009]); base=base/base.sum()  # gizli payi ailede de akar ama sadelestir
    out=[]
    for r in range(runs):
        owned=np.zeros(30,bool); n_ctr=d_ctr=e_ctr=0; eggs=0
        while owned.sum()<30:
            eggs+=1
            if e_ctr>=HARD_E-1: tier=4
            else:
                w=base.copy()
                if e_ctr>=SOFT_START-1:
                    w[4]=min(0.95,base[4]+SOFT_STEP*(e_ctr-SOFT_START+2)); w[:4]*=(1-w[4])/w[:4].sum()
                tier=int(np.searchsorted(np.cumsum(w/w.sum()),rng.random()))
                if d_ctr>=PITY_D-1 and tier<3: tier=3
                elif n_ctr>=PITY_N-1 and tier<2: tier=2
            pool=by_tier[tier]; miss=pool[~owned[pool]]
            if tier==4: sel=pool[0]
            elif len(miss)>0:
                wm = W_MISS_END if owned.sum()>=27 else W_MISS_BASE
                pm = wm*len(miss)/(wm*len(miss)+(len(pool)-len(miss)))
                sel = miss[rng.integers(len(miss))] if rng.random()<pm else pool[rng.integers(len(pool))]
            else: sel=pool[rng.integers(len(pool))]
            owned[sel]=True if not owned[sel] else owned[sel]
            if not owned[sel]: owned[sel]=True
            owned[sel]=True
            if tier>=2:n_ctr=0
            else:n_ctr+=1
            if tier>=3:d_ctr=0
            else:d_ctr+=1
            if tier>=4:e_ctr=0
            else:e_ctr+=1
        out.append(eggs)
    a=np.array(out); return np.percentile(a,10),np.median(a),np.percentile(a,90)
print("Tek aile (hedefli yumurta, pity+smart, craftsiz): P10/med/P90 =", sim_family())
