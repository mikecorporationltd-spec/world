import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { CurrencyProvider } from "./contexts/CurrencyContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Competitions from "./pages/Competitions";
import CompetitionDetail from "./pages/CompetitionDetail";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import AdminTools from "./pages/AdminTools";
import SyncMonitor from "./pages/SyncMonitor";
import SubmitCar from "./pages/SubmitCar";
import HowItWorks from "./pages/HowItWorks";
import Winners from "./pages/Winners";
import VIP from "./pages/VIP";
import Sitemap from "./pages/Sitemap";
import BlogPost from "./pages/BlogPost";
import WinnerStory from "./pages/WinnerStory";
import CarBrand from "./pages/CarBrand";
import SitemapXML from "./pages/SitemapXML";
import AISitemapXML from "./pages/AISitemapXML";
import SitemapIndex from "./pages/SitemapIndex";
import CompetitionsSitemap from "./pages/CompetitionsSitemap";
import BlogSitemap from "./pages/BlogSitemap";
import WinnersSitemap from "./pages/WinnersSitemap";
import BrandsSitemap from "./pages/BrandsSitemap";
import ImageSitemap from "./pages/ImageSitemap";
import Transparency from "./pages/Transparency";
import Games from "./pages/Games";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import CookiePolicy from "./pages/CookiePolicy";
import ResponsibleGaming from "./pages/ResponsibleGaming";
import Blog from "./pages/Blog";
import HowToWin from "./pages/HowToWin";
import HelpCenter from "./pages/HelpCenter";
import Referral from "./pages/Referral";
import Contact from "./pages/Contact";
import WhyChooseUs from "./pages/WhyChooseUs";
import PaymentMethods from "./pages/PaymentMethods";
import Delivery from "./pages/Delivery";
import Affiliate from "./pages/Affiliate";
import Testimonials from "./pages/Testimonials";
import DrawResults from "./pages/DrawResults";
import DrawSchedule from "./pages/DrawSchedule";
import Press from "./pages/Press";
import SEOAudit from "./pages/SEOAudit";
import FAQ from "./pages/FAQ";
import FAQIsTombolaFixed from "./pages/FAQIsTombolaFixed";
import FAQWelcomeBonus from "./pages/FAQWelcomeBonus";
import FAQHowToPlay from "./pages/FAQHowToPlay";
import FAQPayments from "./pages/FAQPayments";
import FAQAccountIssues from "./pages/FAQAccountIssues";
import FAQWinningStrategies from "./pages/FAQWinningStrategies";
import FAQFreeGames from "./pages/FAQFreeGames";
import FAQResponsibleGaming from "./pages/FAQResponsibleGaming";
import FAQCompanyInfo from "./pages/FAQCompanyInfo";
import FAQCompetitionTerms from "./pages/FAQCompetitionTerms";
import BlogPost404 from "./pages/BlogPost404";
import FAQQuestion from "./pages/FAQQuestion";
import InstantWin from "./pages/InstantWin";
import InstantWinList from "./pages/InstantWinList";
import DrawLedger from "./pages/DrawLedger";
import Verify from "./pages/Verify";
import Complaints from "./pages/Complaints";
import Refunds from "./pages/Refunds";
import About from "./pages/About";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <CurrencyProvider>
            <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/competitions" element={<Competitions />} />
          <Route path="/competition/:slug" element={<CompetitionDetail />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
          <Route path="/admin-tools" element={<ProtectedRoute><AdminTools /></ProtectedRoute>} />
          <Route path="/sync-monitor" element={<ProtectedRoute><SyncMonitor /></ProtectedRoute>} />
          <Route path="/seo-audit" element={<ProtectedRoute><SEOAudit /></ProtectedRoute>} />
          <Route path="/submit-car" element={<ProtectedRoute><SubmitCar /></ProtectedRoute>} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/winners" element={<Winners />} />
          <Route path="/winners/:slug" element={<WinnerStory />} />
          <Route path="/vip" element={<VIP />} />
          <Route path="/games" element={<Games />} />
          <Route path="/sitemap" element={<Sitemap />} />
          <Route path="/sitemap.xml" element={<SitemapXML />} />
          <Route path="/sitemap-index.xml" element={<SitemapIndex />} />
          <Route path="/competitions-sitemap.xml" element={<CompetitionsSitemap />} />
          <Route path="/blog-sitemap.xml" element={<BlogSitemap />} />
          <Route path="/winners-sitemap.xml" element={<WinnersSitemap />} />
          <Route path="/brands-sitemap.xml" element={<BrandsSitemap />} />
          <Route path="/image-sitemap.xml" element={<ImageSitemap />} />
          <Route path="/ai-sitemap.xml" element={<AISitemapXML />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/car-brands/:slug" element={<CarBrand />} />
          <Route path="/transparency" element={<Transparency />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/cookie-policy" element={<CookiePolicy />} />
          <Route path="/responsible-gaming" element={<ResponsibleGaming />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/how-to-win" element={<HowToWin />} />
          <Route path="/help" element={<HelpCenter />} />
          <Route path="/referral" element={<Referral />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/why-choose-us" element={<WhyChooseUs />} />
          <Route path="/payment-methods" element={<PaymentMethods />} />
          <Route path="/delivery" element={<Delivery />} />
          <Route path="/affiliate" element={<Affiliate />} />
          <Route path="/testimonials" element={<Testimonials />} />
          <Route path="/draw-results" element={<DrawResults />} />
          <Route path="/draw-schedule" element={<DrawSchedule />} />
          <Route path="/press" element={<Press />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/faq/is-tombola-fixed" element={<FAQIsTombolaFixed />} />
          <Route path="/faq/welcome-bonus" element={<FAQWelcomeBonus />} />
          <Route path="/faq/how-to-play" element={<FAQHowToPlay />} />
          <Route path="/faq/payments" element={<FAQPayments />} />
          <Route path="/faq/account-issues" element={<FAQAccountIssues />} />
          <Route path="/faq/winning-strategies" element={<FAQWinningStrategies />} />
          <Route path="/faq/free-games" element={<FAQFreeGames />} />
          <Route path="/faq/responsible-gaming" element={<FAQResponsibleGaming />} />
          <Route path="/faq/company-info" element={<FAQCompanyInfo />} />
          <Route path="/faq/competition-terms" element={<FAQCompetitionTerms />} />
          <Route path="/instant-win" element={<InstantWinList />} />
          <Route path="/instant-win/:slug" element={<InstantWin />} />
          <Route path="/draw-ledger" element={<DrawLedger />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/complaints" element={<Complaints />} />
          <Route path="/refunds" element={<Refunds />} />
          <Route path="/about" element={<About />} />
          {/* Dynamic FAQ Question Routes - must be before catch-all */}
          <Route path="/:slug" element={<FAQQuestion />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
            </Routes>
          </CurrencyProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
