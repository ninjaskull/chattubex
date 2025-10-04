import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Calendar as CalendarIcon,
  Clock,
  User,
  Mail,
  Building2,
  Phone,
  MessageSquare,
  Check,
  Users,
  ChevronLeft,
  ArrowRight,
  Menu
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import fallOwlLogo from "@assets/FallOwl_logo_1759280190715.png";
import { format } from "date-fns";

const bookingSchema = z.object({
  fullName: z.string().min(2, "Required"),
  email: z.string().email("Invalid"),
  company: z.string().min(2, "Required"),
  phone: z.string().min(10, "Required"),
  teamSize: z.string().min(1, "Required"),
  message: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

const timeSlots = [
  "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"
];

const teamSizes = ["1-10", "11-50", "51-200", "201-500", "500+"];

export default function DemoBooking() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [currentTab, setCurrentTab] = useState<"datetime" | "info">("datetime");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    mode: "onChange",
    defaultValues: {
      fullName: "",
      email: "",
      company: "",
      phone: "",
      teamSize: "",
      message: ""
    }
  });

  const formValues = watch();

  const onSubmit = (data: BookingFormData) => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Missing date/time",
        variant: "destructive"
      });
      return;
    }

    console.log("Demo booking:", { ...data, date: selectedDate, time: selectedTime });
    setIsSubmitted(true);
  };

  const canProceed = selectedDate && selectedTime;

  if (isSubmitted) {
    return (
      <div className="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-md"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-20 h-20 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl"
          >
            <Check className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-3">Confirmed!</h1>
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20 mb-6">
            <div className="flex items-center justify-center gap-2 text-purple-200 mb-2">
              <CalendarIcon className="w-4 h-4" />
              <span className="font-medium">
                {selectedDate && format(selectedDate, "MMM d")} • {selectedTime}
              </span>
            </div>
            <p className="text-sm text-purple-300">Check your email</p>
          </div>
          <Button
            className="bg-white text-purple-900 hover:bg-purple-50"
            onClick={() => setLocation("/")}
            data-testid="button-back-home"
          >
            Back to Home
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7F5] text-slate-900">
      {/* Navigation */}
      <nav className="relative top-4 left-0 right-0 z-50 px-4 md:px-6 lg:px-8 mb-8">
        <div className="max-w-7xl mx-auto bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-lg shadow-slate-900/5">
          <div className="px-4 md:px-6">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center cursor-pointer" onClick={() => setLocation("/")}>
                <img 
                  src={fallOwlLogo} 
                  alt="FallOwl" 
                  className="h-10 w-auto object-contain"
                />
              </div>
              
              <div className="hidden md:flex items-center space-x-8">
                <a href="/features" className="text-sm font-medium text-slate-700 hover:text-purple-600 transition-colors" onClick={(e) => { e.preventDefault(); setLocation("/features"); }}>Features</a>
                <a href="/#integrations" className="text-sm font-medium text-slate-700 hover:text-purple-600 transition-colors">Integrations</a>
                <a href="/about" className="text-sm font-medium text-slate-700 hover:text-purple-600 transition-colors" onClick={(e) => { e.preventDefault(); setLocation("/about"); }}>About</a>
                <a href="/api-docs" className="text-sm font-medium text-slate-700 hover:text-purple-600 transition-colors" onClick={(e) => { e.preventDefault(); setLocation("/api-docs"); }}>API Doc</a>
                <Button 
                  size="sm" 
                  className="bg-slate-900 hover:bg-slate-800 text-white text-sm rounded-xl"
                  onClick={() => window.location.href = 'https://app.fallowl.com'}
                >
                  Sign in
                </Button>
              </div>

              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </div>

            {isMenuOpen && (
              <div className="md:hidden py-4 border-t border-gray-200">
                <div className="flex flex-col space-y-3">
                  <a href="/features" className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-purple-600 rounded-lg hover:bg-slate-50 transition-colors" onClick={(e) => { e.preventDefault(); setLocation("/features"); }}>Features</a>
                  <a href="/#integrations" className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-purple-600 rounded-lg hover:bg-slate-50 transition-colors">Integrations</a>
                  <a href="/about" className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-purple-600 rounded-lg hover:bg-slate-50 transition-colors" onClick={(e) => { e.preventDefault(); setLocation("/about"); }}>About</a>
                  <a href="/api-docs" className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-purple-600 rounded-lg hover:bg-slate-50 transition-colors" onClick={(e) => { e.preventDefault(); setLocation("/api-docs"); }}>API Doc</a>
                  <div className="px-4 pt-2">
                    <Button 
                      size="sm" 
                      className="bg-slate-900 hover:bg-slate-800 text-white w-full rounded-xl"
                      onClick={() => window.location.href = 'https://app.fallowl.com'}
                    >
                      Sign in
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content - Full Height */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
        <div className="w-full max-w-5xl h-full max-h-[calc(100vh-8rem)] flex flex-col">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col"
          >
            {/* Title */}
            <div className="text-center mb-4 flex-none">
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 bg-clip-text text-transparent mb-1">
                Schedule Your Demo
              </h1>
              <p className="text-slate-600 text-sm">30-minute personalized session</p>
            </div>

            {/* Main Card - Takes remaining space */}
            <Card className="flex-1 bg-white/80 backdrop-blur-xl border-gray-200 shadow-2xl flex flex-col overflow-hidden">
              <CardContent className="p-4 flex-1 flex flex-col overflow-hidden">
                <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
                  
                  {/* Tab Navigation */}
                  <div className="flex gap-2 mb-3 flex-none">
                    <button
                      type="button"
                      onClick={() => setCurrentTab("datetime")}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                        currentTab === "datetime"
                          ? "bg-slate-900 text-white shadow-md"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      <CalendarIcon className="w-4 h-4 inline mr-1" />
                      Date & Time
                    </button>
                    <button
                      type="button"
                      onClick={() => canProceed ? setCurrentTab("info") : toast({ title: "Select date & time first", variant: "destructive" })}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                        currentTab === "info"
                          ? "bg-slate-900 text-white shadow-md"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      <User className="w-4 h-4 inline mr-1" />
                      Your Info
                    </button>
                  </div>

                  {/* Content Area - Scrollable if needed */}
                  <div className="flex-1 overflow-y-auto">
                    <AnimatePresence mode="wait">
                      {currentTab === "datetime" && (
                        <motion.div
                          key="datetime"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.2 }}
                          className="grid lg:grid-cols-2 gap-4 h-full"
                        >
                          {/* Calendar */}
                          <div className="flex flex-col">
                            <Label className="text-xs font-semibold mb-2 flex items-center gap-1">
                              <CalendarIcon className="w-3.5 h-3.5 text-slate-900" />
                              Select Date
                            </Label>
                            <div className="bg-gradient-to-br from-purple-50 to-slate-50 rounded-xl p-2 border border-purple-100 flex items-center justify-center">
                              <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={setSelectedDate}
                                disabled={(date) => date < new Date() || date.getDay() === 0 || date.getDay() === 6}
                                className="rounded-lg border-0 scale-90"
                                data-testid="calendar-demo"
                              />
                            </div>
                          </div>

                          {/* Time Slots */}
                          <div className="flex flex-col">
                            <Label className="text-xs font-semibold mb-2 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-900" />
                              Select Time (EST)
                            </Label>
                            <div className="bg-gradient-to-br from-slate-50 to-purple-50 rounded-xl p-3 border border-purple-100 flex-1">
                              <div className="grid grid-cols-3 gap-2">
                                {timeSlots.map((time) => (
                                  <motion.button
                                    key={time}
                                    type="button"
                                    onClick={() => setSelectedTime(time)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={`py-2 text-sm font-medium rounded-lg transition-all ${
                                      selectedTime === time
                                        ? "bg-slate-900 text-white shadow-lg"
                                        : "bg-white hover:bg-slate-50 text-slate-700 border border-gray-200"
                                    }`}
                                    data-testid={`time-${time}`}
                                  >
                                    {time}
                                  </motion.button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {currentTab === "info" && (
                        <motion.div
                          key="info"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.2 }}
                          className="space-y-3"
                        >
                          {/* Selected DateTime Display */}
                          {selectedDate && selectedTime && (
                            <div className="bg-slate-100 border border-slate-200 rounded-lg p-2 mb-3">
                              <div className="flex items-center gap-2 text-slate-900 text-sm font-medium">
                                <Check className="w-4 h-4" />
                                {format(selectedDate, "EEE, MMM d")} at {selectedTime}
                              </div>
                            </div>
                          )}

                          <div className="grid sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label htmlFor="fullName" className="text-xs flex items-center gap-1">
                                <User className="w-3 h-3" /> Name
                              </Label>
                              <Input
                                id="fullName"
                                {...register("fullName")}
                                placeholder="John Smith"
                                className="h-9 text-sm"
                                autoComplete="off"
                                data-testid="input-fullname"
                              />
                              {errors.fullName && <p className="text-red-500 text-xs">{errors.fullName.message}</p>}
                            </div>

                            <div className="space-y-1">
                              <Label htmlFor="email" className="text-xs flex items-center gap-1">
                                <Mail className="w-3 h-3" /> Email
                              </Label>
                              <Input
                                id="email"
                                type="email"
                                {...register("email")}
                                placeholder="john@company.com"
                                className="h-9 text-sm"
                                autoComplete="off"
                                data-testid="input-email"
                              />
                              {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
                            </div>

                            <div className="space-y-1">
                              <Label htmlFor="company" className="text-xs flex items-center gap-1">
                                <Building2 className="w-3 h-3" /> Company
                              </Label>
                              <Input
                                id="company"
                                {...register("company")}
                                placeholder="Acme Inc."
                                className="h-9 text-sm"
                                autoComplete="off"
                                data-testid="input-company"
                              />
                              {errors.company && <p className="text-red-500 text-xs">{errors.company.message}</p>}
                            </div>

                            <div className="space-y-1">
                              <Label htmlFor="phone" className="text-xs flex items-center gap-1">
                                <Phone className="w-3 h-3" /> Phone
                              </Label>
                              <Input
                                id="phone"
                                {...register("phone")}
                                placeholder="+1 (555) 123-4567"
                                className="h-9 text-sm"
                                autoComplete="off"
                                data-testid="input-phone"
                              />
                              {errors.phone && <p className="text-red-500 text-xs">{errors.phone.message}</p>}
                            </div>

                            <div className="space-y-1 sm:col-span-2">
                              <Label htmlFor="teamSize" className="text-xs flex items-center gap-1">
                                <Users className="w-3 h-3" /> Team Size
                              </Label>
                              <Select
                                value={formValues.teamSize}
                                onValueChange={(value) => setValue("teamSize", value, { shouldValidate: true })}
                              >
                                <SelectTrigger className="h-9 text-sm" data-testid="select-teamsize">
                                  <SelectValue placeholder="Select team size" />
                                </SelectTrigger>
                                <SelectContent>
                                  {teamSizes.map((size) => (
                                    <SelectItem key={size} value={size}>
                                      {size} employees
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {errors.teamSize && <p className="text-red-500 text-xs">{errors.teamSize.message}</p>}
                            </div>

                            <div className="space-y-1 sm:col-span-2">
                              <Label htmlFor="message" className="text-xs flex items-center gap-1">
                                <MessageSquare className="w-3 h-3" /> Notes <span className="text-slate-400">(Optional)</span>
                              </Label>
                              <Textarea
                                id="message"
                                {...register("message")}
                                placeholder="Your specific needs..."
                                rows={2}
                                className="resize-none text-sm"
                                data-testid="input-message"
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-3 flex-none">
                    {currentTab === "info" && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCurrentTab("datetime")}
                        className="flex-1"
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Back
                      </Button>
                    )}
                    {currentTab === "datetime" ? (
                      <Button
                        type="button"
                        onClick={() => canProceed ? setCurrentTab("info") : toast({ title: "Select date & time", variant: "destructive" })}
                        className="flex-1 bg-slate-900 hover:bg-slate-800 text-white"
                      >
                        Continue
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        className="flex-1 bg-slate-900 hover:bg-slate-800 text-white"
                        data-testid="button-submit"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Confirm Booking
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
