export interface IssueType {
  id: string;
  label: string;
}

export interface Department {
  id: string;
  label: string;
  icon: string;
  issues: IssueType[];
}

export interface Domain {
  id: string;
  label: string;
  icon: string;
  color: string;
  departments: Department[];
}

export const DOMAINS: Domain[] = [
  {
    id: 'education',
    label: 'Education',
    icon: '🎓',
    color: '#3b82f6',
    departments: [
      {
        id: 'edu_sanitation',
        label: 'Sanitation & Cleanliness',
        icon: '🧹',
        issues: [
          { id: 'dirty_classrooms', label: 'Dirty classrooms' },
          { id: 'unclean_washrooms', label: 'Unclean washrooms' },
          { id: 'improper_waste_disposal', label: 'Improper waste disposal' },
          { id: 'no_drinking_water_hygiene', label: 'No drinking water hygiene' },
          { id: 'poor_hostel_cleanliness', label: 'Poor hostel cleanliness' },
          { id: 'garbage_accumulation', label: 'Garbage accumulation' },
          { id: 'pest_insect_problems', label: 'Pest / insect problems' },
        ],
      },
      {
        id: 'edu_infrastructure',
        label: 'Infrastructure',
        icon: '🏫',
        issues: [
          { id: 'damaged_classrooms', label: 'Damaged classrooms' },
          { id: 'broken_benches_desks', label: 'Broken benches / desks' },
          { id: 'poor_ventilation', label: 'Poor ventilation' },
          { id: 'inadequate_lighting', label: 'Inadequate lighting' },
          { id: 'lift_ramp_not_working', label: 'Lift / ramp not working' },
          { id: 'unsafe_buildings', label: 'Unsafe buildings' },
          { id: 'playground_issues', label: 'Playground issues' },
          { id: 'library_infrastructure', label: 'Library infrastructure problems' },
          { id: 'hostel_infrastructure', label: 'Hostel infrastructure issues' },
        ],
      },
      {
        id: 'edu_it_technical',
        label: 'IT & Technical',
        icon: '💻',
        issues: [
          { id: 'smart_classroom_not_working', label: 'Smart classroom not working' },
          { id: 'computer_lab_issues', label: 'Computer lab issues' },
          { id: 'internet_wifi_problems', label: 'Internet / Wi-Fi problems' },
          { id: 'lms_portal_login_issues', label: 'LMS / portal login issues' },
          { id: 'online_exam_technical', label: 'Online exam technical issues' },
          { id: 'software_access_problems', label: 'Software access problems' },
          { id: 'project_submission_errors', label: 'Project submission portal errors' },
          { id: 'digital_attendance_issues', label: 'Digital attendance issues' },
        ],
      },
      {
        id: 'edu_administrative',
        label: 'Administrative & Office',
        icon: '🏢',
        issues: [
          { id: 'fee_payment_issues', label: 'Fee payment issues' },
          { id: 'scholarship_delay', label: 'Scholarship delay' },
          { id: 'certificate_issuance_delay', label: 'Certificate issuance delay' },
          { id: 'bonafide_lc_issues', label: 'Bonafide / LC issues' },
          { id: 'staff_misbehavior', label: 'Staff misbehavior' },
          { id: 'office_working_hours', label: 'Office working hours issues' },
          { id: 'document_verification_delays', label: 'Document verification delays' },
          { id: 'admission_problems', label: 'Admission-related problems' },
          { id: 'transfer_migration_issues', label: 'Transfer / migration issues' },
        ],
      },
      {
        id: 'edu_hostel',
        label: 'Hostel & Accommodation',
        icon: '🏠',
        issues: [
          { id: 'room_allocation_issues', label: 'Room allocation issues' },
          { id: 'mess_food_quality', label: 'Mess food quality' },
          { id: 'water_supply_problems', label: 'Water supply problems' },
          { id: 'electricity_issues', label: 'Electricity issues' },
          { id: 'warden_behavior', label: 'Warden behavior' },
          { id: 'curfew_complaints', label: 'Curfew-related complaints' },
          { id: 'laundry_facility_issues', label: 'Laundry facility issues' },
          { id: 'hostel_room_cleanliness', label: 'Cleanliness in hostel rooms' },
        ],
      },
      {
        id: 'edu_transport',
        label: 'Transport (Education)',
        icon: '🚍',
        issues: [
          { id: 'college_bus_delays', label: 'College bus delays' },
          { id: 'bus_overcrowding', label: 'Bus overcrowding' },
          { id: 'unsafe_driving', label: 'Unsafe driving' },
          { id: 'bus_pass_issues', label: 'Bus pass issues' },
          { id: 'route_problems', label: 'Route problems' },
          { id: 'driver_behavior', label: 'Driver behavior' },
          { id: 'vehicle_maintenance', label: 'Vehicle maintenance issues' },
        ],
      },
    ],
  },
  {
    id: 'workplace',
    label: 'Workplace',
    icon: '🏢',
    color: '#8b5cf6',
    departments: [
      {
        id: 'work_sanitation',
        label: 'Sanitation & Cleanliness',
        icon: '🧹',
        issues: [
          { id: 'unclean_washrooms', label: 'Unclean washrooms' },
          { id: 'dirty_work_areas', label: 'Dirty work areas' },
          { id: 'improper_waste_disposal', label: 'Improper waste disposal' },
          { id: 'lack_hygiene_supplies', label: 'Lack of hygiene supplies' },
          { id: 'pantry_cafeteria_cleanliness', label: 'Pantry / cafeteria cleanliness' },
          { id: 'pest_insect_issues', label: 'Pest / insect issues' },
          { id: 'drinking_water_hygiene', label: 'Drinking water hygiene issues' },
        ],
      },
      {
        id: 'work_infrastructure',
        label: 'Infrastructure',
        icon: '🏗️',
        issues: [
          { id: 'poor_building_maintenance', label: 'Poor building maintenance' },
          { id: 'broken_furniture', label: 'Broken furniture' },
          { id: 'faulty_lighting', label: 'Faulty lighting' },
          { id: 'ventilation_ac_issues', label: 'Ventilation / AC issues' },
          { id: 'lift_staircase_problems', label: 'Lift / staircase problems' },
          { id: 'parking_infrastructure', label: 'Parking infrastructure issues' },
          { id: 'workspace_overcrowding', label: 'Workspace overcrowding' },
          { id: 'unsafe_office_structure', label: 'Unsafe office structure' },
        ],
      },
      {
        id: 'work_harassment',
        label: 'Mistreatment & Harassment',
        icon: '⚠️',
        issues: [
          { id: 'verbal_abuse', label: 'Verbal abuse' },
          { id: 'physical_harassment', label: 'Physical harassment' },
          { id: 'sexual_harassment', label: 'Sexual harassment' },
          { id: 'mental_harassment', label: 'Mental harassment' },
          { id: 'bullying', label: 'Bullying' },
          { id: 'threats_intimidation', label: 'Threats or intimidation' },
          { id: 'abuse_of_authority', label: 'Abuse of authority' },
        ],
      },
      {
        id: 'work_safety',
        label: 'Safety & Security',
        icon: '🛡️',
        issues: [
          { id: 'unsafe_working_conditions', label: 'Unsafe working conditions' },
          { id: 'fire_safety_issues', label: 'Fire safety issues' },
          { id: 'emergency_exits_blocked', label: 'Emergency exits blocked' },
          { id: 'lack_safety_equipment', label: 'Lack of safety equipment' },
          { id: 'workplace_accidents', label: 'Workplace accidents' },
          { id: 'inadequate_security_staff', label: 'Inadequate security staff' },
          { id: 'cctv_not_working', label: 'CCTV not working' },
        ],
      },
      {
        id: 'work_it_technical',
        label: 'IT & Technical',
        icon: '💻',
        issues: [
          { id: 'system_access_issues', label: 'System access issues' },
          { id: 'email_login_problems', label: 'Email / login problems' },
          { id: 'software_license_issues', label: 'Software license issues' },
          { id: 'network_internet_problems', label: 'Network / internet problems' },
          { id: 'hardware_issues', label: 'Hardware issues (PC, printer)' },
          { id: 'data_security_concerns', label: 'Data security concerns' },
        ],
      },
    ],
  },
  {
    id: 'transport',
    label: 'Transport',
    icon: '🚍',
    color: '#f59e0b',
    departments: [
      {
        id: 'trans_service',
        label: 'Service & Timeliness',
        icon: '⏱️',
        issues: [
          { id: 'bus_train_delays', label: 'Bus / train delays' },
          { id: 'irregular_schedules', label: 'Irregular service schedules' },
          { id: 'route_cancellation', label: 'Route cancellation without notice' },
          { id: 'missed_skipped_stops', label: 'Missed or skipped stops' },
          { id: 'early_departure', label: 'Early departure issues' },
        ],
      },
      {
        id: 'trans_cleanliness',
        label: 'Cleanliness & Hygiene',
        icon: '🧹',
        issues: [
          { id: 'unclean_buses_trains', label: 'Unclean buses / trains' },
          { id: 'dirty_seats_floors', label: 'Dirty seats and floors' },
          { id: 'waste_accumulation', label: 'Waste accumulation' },
          { id: 'poor_station_sanitation', label: 'Poor sanitation at stations / stops' },
          { id: 'unhygienic_restrooms', label: 'Unhygienic restrooms at terminals' },
        ],
      },
      {
        id: 'trans_safety',
        label: 'Safety & Security',
        icon: '🚦',
        issues: [
          { id: 'rash_unsafe_driving', label: 'Rash or unsafe driving' },
          { id: 'over_speeding', label: 'Over-speeding' },
          { id: 'lack_safety_instructions', label: 'Lack of safety instructions' },
          { id: 'non_functional_emergency_exits', label: 'Non-functional emergency exits' },
          { id: 'no_cctv_security', label: 'No CCTV or security staff' },
          { id: 'women_safety_concerns', label: 'Women safety concerns' },
          { id: 'pickpocketing_theft', label: 'Pickpocketing / theft' },
        ],
      },
      {
        id: 'trans_route',
        label: 'Route & Connectivity',
        icon: '🛣️',
        issues: [
          { id: 'poor_route_planning', label: 'Poor route planning' },
          { id: 'lack_connectivity_remote', label: 'Lack of connectivity to remote areas' },
          { id: 'sudden_route_changes', label: 'Sudden route changes' },
          { id: 'inadequate_frequency', label: 'Inadequate frequency on busy routes' },
          { id: 'no_last_mile_connectivity', label: 'No last-mile connectivity' },
        ],
      },
      {
        id: 'trans_accessibility',
        label: 'Accessibility & Inclusion',
        icon: '🧑‍🦽',
        issues: [
          { id: 'no_wheelchair_access', label: 'No wheelchair access' },
          { id: 'non_functional_ramps', label: 'Non-functional ramps' },
          { id: 'lack_priority_seating', label: 'Lack of priority seating' },
          { id: 'elderly_passenger_issues', label: 'Issues for elderly passengers' },
          { id: 'disabled_friendly_unavailable', label: 'Disabled-friendly transport unavailable' },
        ],
      },
    ],
  },
  {
    id: 'health',
    label: 'Health',
    icon: '🏥',
    color: '#ef4444',
    departments: [
      {
        id: 'health_emergency',
        label: 'Emergency & Ambulance Services',
        icon: '🚑',
        issues: [
          { id: 'ambulance_not_available', label: 'Ambulance not available' },
          { id: 'ambulance_arrived_late', label: 'Ambulance arrived late' },
          { id: 'no_ambulance_rural', label: 'No ambulance in rural area' },
          { id: 'ambulance_without_staff', label: 'Ambulance without medical staff' },
          { id: 'ambulance_equipment_not_working', label: 'Ambulance equipment not working' },
          { id: 'emergency_helpline_not_responding', label: 'Emergency helpline not responding' },
          { id: 'poor_emergency_coordination', label: 'Poor coordination during emergency' },
        ],
      },
      {
        id: 'health_hospital',
        label: 'Hospital Availability & Access',
        icon: '🏥',
        issues: [
          { id: 'no_nearby_hospital', label: 'No nearby government hospital' },
          { id: 'hospital_overcrowded', label: 'Hospital overcrowded' },
          { id: 'no_beds_available', label: 'No beds available' },
          { id: 'icu_unavailable', label: 'ICU unavailable' },
          { id: 'emergency_ward_closed', label: 'Emergency ward closed' },
          { id: 'hospital_refusing_patients', label: 'Hospital refusing patients' },
          { id: 'distance_too_far', label: 'Distance to hospital too far' },
        ],
      },
      {
        id: 'health_medicines',
        label: 'Medicines & Medical Supplies',
        icon: '💊',
        issues: [
          { id: 'essential_medicines_unavailable', label: 'Essential medicines unavailable' },
          { id: 'govt_pharmacy_closed', label: 'Government pharmacy closed' },
          { id: 'expired_medicines', label: 'Expired medicines supplied' },
          { id: 'free_medicines_not_provided', label: 'Free medicines not provided' },
          { id: 'oxygen_supply_shortage', label: 'Oxygen / medical supply shortage' },
        ],
      },
      {
        id: 'health_diagnostic',
        label: 'Diagnostic & Test Services',
        icon: '🧪',
        issues: [
          { id: 'lab_tests_unavailable', label: 'Lab tests unavailable' },
          { id: 'delay_test_reports', label: 'Delay in test reports' },
          { id: 'diagnostic_center_closed', label: 'Diagnostic center closed' },
          { id: 'high_cost_tests', label: 'High cost of medical tests' },
          { id: 'mobile_testing_unavailable', label: 'Mobile testing unit not available' },
        ],
      },
      {
        id: 'health_mental',
        label: 'Mental Health Services',
        icon: '🧠',
        issues: [
          { id: 'mental_health_unavailable', label: 'Mental health services unavailable' },
          { id: 'no_counselor_psychologist', label: 'No counselor or psychologist' },
          { id: 'mental_helpline_not_working', label: 'Mental health helpline not working' },
          { id: 'lack_awareness_programs', label: 'Lack of awareness programs' },
          { id: 'delay_mental_emergency_care', label: 'Delay in emergency mental care' },
        ],
      },
      {
        id: 'health_sanitation',
        label: 'Sanitation & Hygiene in Health Facilities',
        icon: '🧹',
        issues: [
          { id: 'unclean_hospitals', label: 'Unclean hospitals' },
          { id: 'dirty_health_centers', label: 'Dirty public health centers' },
          { id: 'poor_waste_disposal', label: 'Poor waste disposal' },
          { id: 'lack_drinking_water', label: 'Lack of drinking water' },
          { id: 'unhygienic_washrooms', label: 'Unhygienic washrooms' },
        ],
      },
    ],
  },
  {
    id: 'civic',
    label: 'Civic',
    icon: '🏛️',
    color: '#10b981',
    departments: [
      {
        id: 'civic_garbage',
        label: 'Garbage Collection & Waste Management',
        icon: '🚮',
        issues: [
          { id: 'garbage_not_collected', label: 'Garbage not collected' },
          { id: 'irregular_garbage_pickup', label: 'Irregular garbage pickup' },
          { id: 'overflowing_garbage_bins', label: 'Overflowing garbage bins' },
          { id: 'no_garbage_bins', label: 'No garbage bins in area' },
          { id: 'improper_waste_segregation', label: 'Improper waste segregation' },
          { id: 'bad_smell_waste', label: 'Bad smell from waste' },
          { id: 'biomedical_waste_dumped', label: 'Biomedical waste dumped in public' },
        ],
      },
      {
        id: 'civic_water',
        label: 'Water Supply & Quality',
        icon: '🚰',
        issues: [
          { id: 'no_water_supply', label: 'No water supply' },
          { id: 'irregular_water_supply', label: 'Irregular water supply' },
          { id: 'low_water_pressure', label: 'Low water pressure' },
          { id: 'contaminated_dirty_water', label: 'Contaminated / dirty water' },
          { id: 'water_leakage', label: 'Water leakage from pipelines' },
          { id: 'tanker_water_issues', label: 'Tanker water issues' },
          { id: 'water_supply_timing', label: 'Water supply timing issues' },
        ],
      },
      {
        id: 'civic_drainage',
        label: 'Drainage & Sewerage',
        icon: '🚽',
        issues: [
          { id: 'drainage_overflow', label: 'Drainage overflow' },
          { id: 'sewer_blockage', label: 'Sewer blockage' },
          { id: 'open_drains', label: 'Open drains' },
          { id: 'foul_smell_drains', label: 'Foul smell from drains' },
          { id: 'waterlogging', label: 'Waterlogging after rain' },
          { id: 'broken_manhole_covers', label: 'Broken manhole covers' },
        ],
      },
      {
        id: 'civic_roads',
        label: 'Roads & Infrastructure',
        icon: '🛣️',
        issues: [
          { id: 'potholes', label: 'Potholes on roads' },
          { id: 'damaged_roads', label: 'Damaged roads' },
          { id: 'incomplete_road_work', label: 'Incomplete road work' },
          { id: 'poor_road_resurfacing', label: 'Poor road resurfacing' },
          { id: 'footpath_encroachment', label: 'Footpath encroachment' },
          { id: 'broken_dividers', label: 'Broken dividers' },
        ],
      },
      {
        id: 'civic_streetlights',
        label: 'Street Lights & Electricity',
        icon: '💡',
        issues: [
          { id: 'street_lights_not_working', label: 'Street lights not working' },
          { id: 'flickering_lights', label: 'Flickering street lights' },
          { id: 'no_street_lights', label: 'No street lights in area' },
          { id: 'damaged_electric_poles', label: 'Damaged electric poles' },
          { id: 'exposed_electric_wires', label: 'Exposed electric wires' },
          { id: 'power_outage_public', label: 'Power outage in public areas' },
        ],
      },
      {
        id: 'civic_stray',
        label: 'Stray Animals & Pest Control',
        icon: '🐕',
        issues: [
          { id: 'stray_dog_menace', label: 'Stray dog menace' },
          { id: 'animal_biting', label: 'Animal biting incidents' },
          { id: 'dead_animals_not_removed', label: 'Dead animals not removed' },
          { id: 'mosquito_breeding', label: 'Mosquito breeding' },
          { id: 'rodent_infestation', label: 'Rodent infestation' },
          { id: 'lack_pest_control', label: 'Lack of pest control drives' },
        ],
      },
      {
        id: 'civic_pollution',
        label: 'Noise & Environmental Pollution',
        icon: '🔊',
        issues: [
          { id: 'loudspeakers_beyond_time', label: 'Loudspeakers beyond permitted time' },
          { id: 'construction_noise', label: 'Construction noise' },
          { id: 'industrial_noise', label: 'Industrial noise pollution' },
          { id: 'air_pollution', label: 'Air pollution' },
          { id: 'open_burning_waste', label: 'Open burning of waste' },
          { id: 'water_body_pollution', label: 'Water body pollution' },
        ],
      },
      {
        id: 'civic_toilets',
        label: 'Public Toilets & Sanitation',
        icon: '🚾',
        issues: [
          { id: 'public_toilets_unavailable', label: 'Public toilets not available' },
          { id: 'toilets_locked', label: 'Toilets locked' },
          { id: 'dirty_public_toilets', label: 'Dirty public toilets' },
          { id: 'no_water_in_toilets', label: 'No water in toilets' },
          { id: 'toilets_unsafe_women', label: 'Toilets unsafe for women' },
        ],
      },
    ],
  },
];

export const getDomainById = (domainId: string): Domain | undefined => {
  return DOMAINS.find((d) => d.id === domainId);
};

export const getDepartmentById = (departmentId: string): { domain: Domain; department: Department } | undefined => {
  for (const domain of DOMAINS) {
    const department = domain.departments.find((d) => d.id === departmentId);
    if (department) {
      return { domain, department };
    }
  }
  return undefined;
};

export const getIssueById = (issueId: string): { domain: Domain; department: Department; issue: IssueType } | undefined => {
  for (const domain of DOMAINS) {
    for (const department of domain.departments) {
      const issue = department.issues.find((i) => i.id === issueId);
      if (issue) {
        return { domain, department, issue };
      }
    }
  }
  return undefined;
};

export const getDepartmentsByDomain = (domainId: string): Department[] => {
  const domain = DOMAINS.find((d) => d.id === domainId);
  return domain?.departments || [];
};

export const getAllDepartmentIds = (): string[] => {
  return DOMAINS.flatMap((d) => d.departments.map((dept) => dept.id));
};

export const getDomainByDepartment = (departmentId: string): Domain | undefined => {
  return DOMAINS.find((d) => d.departments.some((dept) => dept.id === departmentId));
};

export const DOMAIN_LABELS: Record<string, string> = {
  education: 'Education',
  workplace: 'Workplace',
  transport: 'Transport',
  health: 'Health',
  civic: 'Civic',
};

export const DOMAIN_COLORS: Record<string, string> = {
  education: '#3b82f6',
  workplace: '#8b5cf6',
  transport: '#f59e0b',
  health: '#ef4444',
  civic: '#10b981',
};
