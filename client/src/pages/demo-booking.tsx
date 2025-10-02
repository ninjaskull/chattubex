import { useState, useEffect } from "react";
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
  Sparkles,
  Users,
  Video,
  ChevronLeft,
  Zap,
  TrendingUp,
  Award
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import fallOwlLogo from "@assets/FallOwl_logo_1759280190715.png";
import { format } from "date-fns";

const bookingSchema = z.object({
  fullName: z.string().min(2, "Name required"),
  email: z.string().email("Invalid email"),
  company: z.string().min(2, "Company required"),
  phone: z.string().min(10, "Phone required"),
  teamSize: z.string().min(1, "Team size required"),
  message: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00"
];

const teamSizes = ["1-10", "11-50", "51-200", "201-500", "500+"];

export default function DemoBooking() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [focusedField, setFocusedField] = useState<string>("");
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
    trigger
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
  const completedFields = Object.entries(formValues).filter(([key, value]) => 
    key !== "message" && value && value.length > 0
  ).length;
  const totalFields = 5;
  const progress = (completedFields / totalFields) * 100;

  const onSubmit = (data: BookingFormData) => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Missing Information",
        description: "Please select date and time",
        variant: "destructive"
      });
      return;
    }

    console.log("Demo booking:", { ...data, date: selectedDate, time: selectedTime });
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-md"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl"
          >
            <Check className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-3">Demo Confirmed!</h1>
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20 mb-6">
            <div className="flex items-center justify-center gap-2 text-purple-200 mb-2">
              <CalendarIcon className="w-4 h-4" />
              <span className="font-medium">
                {selectedDate && format(selectedDate, "EEE, MMM d")} • {selectedTime}
              </span>
            </div>
            <p className="text-sm text-purple-300">Calendar invite sent to your email</p>
          </div>
          <Button
            size="lg"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-50">
      {/* Compact Header */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/")}
              className="text-slate-700 hover:text-purple-600 h-8"
              data-testid="button-back"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <img src={fallOwlLogo} alt="FallOwl" className="h-8 w-auto" />
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-600">
              <div className="w-32 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-purple-500 to-purple-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <span className="text-xs font-medium">{Math.round(progress)}%</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content - Compact Single Column */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Hero Section - Compact */}
          <div className="text-center mb-6">
            <h1 className="text-4xl sm:text-5xl font-bold mb-3 bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 bg-clip-text text-transparent">
              Schedule Your Demo
            </h1>
            <p className="text-slate-600 text-lg mb-4">
              30-minute personalized walkthrough with our team
            </p>
            
            {/* Compact Benefits Bar */}
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              {[
                { icon: Video, text: "Live Demo" },
                { icon: Zap, text: "Instant Setup" },
                { icon: Award, text: "Expert Guide" }
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex items-center gap-1.5 text-slate-700">
                    <Icon className="w-4 h-4 text-purple-600" />
                    <span>{item.text}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Main Card - Compact Design */}
          <Card className="bg-white/80 backdrop-blur-xl border-gray-200 shadow-2xl overflow-hidden">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                
                {/* Date & Time Selection - Horizontal Layout */}
                <div className="grid lg:grid-cols-2 gap-4">
                  {/* Calendar Section */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-purple-600" />
                      Select Date
                    </Label>
                    <div className="bg-gradient-to-br from-purple-50 to-slate-50 rounded-xl p-3 border border-purple-100">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => date < new Date() || date.getDay() === 0 || date.getDay() === 6}
                        className="rounded-lg border-0"
                        data-testid="calendar-demo"
                      />
                    </div>
                  </div>

                  {/* Time Slots - Compact Grid */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold flex items-center gap-2">
                      <Clock className="w-4 h-4 text-purple-600" />
                      Select Time (EST)
                    </Label>
                    <div className="bg-gradient-to-br from-slate-50 to-purple-50 rounded-xl p-3 border border-purple-100 max-h-[340px] overflow-y-auto">
                      <div className="grid grid-cols-3 gap-2">
                        {timeSlots.map((time) => (
                          <motion.button
                            key={time}
                            type="button"
                            onClick={() => setSelectedTime(time)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                              selectedTime === time
                                ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg"
                                : "bg-white hover:bg-purple-50 text-slate-700 border border-gray-200"
                            }`}
                            data-testid={`time-${time}`}
                          >
                            {time}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Selected DateTime Display */}
                {selectedDate && selectedTime && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="bg-gradient-to-r from-purple-100 to-purple-50 border border-purple-200 rounded-xl p-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-purple-900 font-medium">
                        <Check className="w-4 h-4" />
                        <span className="text-sm">
                          {format(selectedDate, "EEEE, MMMM d")} at {selectedTime}
                        </span>
                      </div>
                      <Sparkles className="w-4 h-4 text-purple-600" />
                    </div>
                  </motion.div>
                )}

                {/* Form Fields - Compact 2 Column Layout */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="fullName" className="text-xs font-medium flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      Full Name
                    </Label>
                    <div className="relative">
                      <Input
                        id="fullName"
                        {...register("fullName")}
                        placeholder="John Smith"
                        className={`h-10 ${errors.fullName ? "border-red-500" : focusedField === "fullName" ? "border-purple-500" : ""} transition-all`}
                        onFocus={() => setFocusedField("fullName")}
                        onBlur={() => setFocusedField("")}
                        data-testid="input-fullname"
                      />
                      {!errors.fullName && formValues.fullName && (
                        <Check className="absolute right-3 top-2.5 w-5 h-5 text-green-500" />
                      )}
                    </div>
                    {errors.fullName && (
                      <p className="text-red-500 text-xs">{errors.fullName.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-medium flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5" />
                      Email
                    </Label>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        {...register("email")}
                        placeholder="john@company.com"
                        className={`h-10 ${errors.email ? "border-red-500" : focusedField === "email" ? "border-purple-500" : ""} transition-all`}
                        onFocus={() => setFocusedField("email")}
                        onBlur={() => setFocusedField("")}
                        data-testid="input-email"
                      />
                      {!errors.email && formValues.email && formValues.email.includes("@") && (
                        <Check className="absolute right-3 top-2.5 w-5 h-5 text-green-500" />
                      )}
                    </div>
                    {errors.email && (
                      <p className="text-red-500 text-xs">{errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="company" className="text-xs font-medium flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5" />
                      Company
                    </Label>
                    <div className="relative">
                      <Input
                        id="company"
                        {...register("company")}
                        placeholder="Acme Inc."
                        className={`h-10 ${errors.company ? "border-red-500" : focusedField === "company" ? "border-purple-500" : ""} transition-all`}
                        onFocus={() => setFocusedField("company")}
                        onBlur={() => setFocusedField("")}
                        data-testid="input-company"
                      />
                      {!errors.company && formValues.company && (
                        <Check className="absolute right-3 top-2.5 w-5 h-5 text-green-500" />
                      )}
                    </div>
                    {errors.company && (
                      <p className="text-red-500 text-xs">{errors.company.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-xs font-medium flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" />
                      Phone
                    </Label>
                    <div className="relative">
                      <Input
                        id="phone"
                        {...register("phone")}
                        placeholder="+1 (555) 123-4567"
                        className={`h-10 ${errors.phone ? "border-red-500" : focusedField === "phone" ? "border-purple-500" : ""} transition-all`}
                        onFocus={() => setFocusedField("phone")}
                        onBlur={() => setFocusedField("")}
                        data-testid="input-phone"
                      />
                      {!errors.phone && formValues.phone && formValues.phone.length >= 10 && (
                        <Check className="absolute right-3 top-2.5 w-5 h-5 text-green-500" />
                      )}
                    </div>
                    {errors.phone && (
                      <p className="text-red-500 text-xs">{errors.phone.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="teamSize" className="text-xs font-medium flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      Team Size
                    </Label>
                    <Select
                      value={formValues.teamSize}
                      onValueChange={(value) => setValue("teamSize", value, { shouldValidate: true })}
                    >
                      <SelectTrigger className={`h-10 ${errors.teamSize ? "border-red-500" : ""}`} data-testid="select-teamsize">
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
                    {errors.teamSize && (
                      <p className="text-red-500 text-xs">{errors.teamSize.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="message" className="text-xs font-medium flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5" />
                      Additional Notes <span className="text-slate-400">(Optional)</span>
                    </Label>
                    <Textarea
                      id="message"
                      {...register("message")}
                      placeholder="Tell us about your specific needs..."
                      rows={3}
                      className="resize-none"
                      data-testid="input-message"
                    />
                  </div>
                </div>

                {/* Submit Button - Full Width with Gradient */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="submit"
                    size="lg"
                    disabled={!selectedDate || !selectedTime || !isValid}
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-xl h-12 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    data-testid="button-submit"
                  >
                    <Check className="w-5 h-5 mr-2" />
                    Confirm Demo Booking
                  </Button>
                </motion.div>

                {/* Trust Badge */}
                <div className="flex items-center justify-center gap-6 pt-2 text-xs text-slate-600">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-green-600" />
                    <span>10M+ calls made</span>
                  </div>
                  <div className="w-px h-4 bg-slate-300" />
                  <div className="flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-purple-600" />
                    <span>4.9/5 rated</span>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
