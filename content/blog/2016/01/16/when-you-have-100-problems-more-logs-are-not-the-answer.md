---
title: "When you have 100 problems, more logs are not the answer"
date: "2016-01-16T11:55:16-05:00"
status: publish
permalink: /2016/01/16/when-you-have-100-problems-more-logs-are-not-the-answer
author: ryan@dss-i.com
excerpt: ""
type: post
id: 175
thumbnail: ../../../../uploads/2016/01/big_fire_01.jpg
category:
  - Security
  - Splunk
  - Uncategorized
tag:
  - compliance
  - controls
  - detection
  - priorities
  - SIEM
  - Splunk
  - value
post_format: []
---

![big_fire_01](https://i0.wp.com/www.rfaircloth.com/wp-content/uploads/2016/01/big_fire_01-300x200.jpg?resize=300%2C200) Often SIEM projects begin where log aggregation projects end. So many logs cut into organized stacks of wood ready to burn for value. I can be quoted on this “All logs can be presumed to have security value”. One project to build the worlds largest bonfire however is seldom the correct answer. What value you may ask? Value will be gained in one or more of these categories:

- Compliance – External regulation required collection and retention of this data for a specified period of time.
- Forensics – External event causes the organization to be aware of an activity and the data can be used to determine if a unauthorized or malicious act occurred and the scope of the damage. Bonus if the actor can be identified this is not always the case.

Detection – Rules based logic can be applied to the data as generated to detect interesting events for investigation. At Splunk we call these searches correlation searches, which generate notable events. Notable events may or may not be incidents.

- Analytic – Aggregation of the can allow human or machine learning based detection of actions that are notable.
- Tuning – Rules based logic applied to detection and aggregation sources can identify opportunities to improve preventive controls which will reduce the risk profile of the organization. This will include such things as adjustment to web proxy and UTM devices when malware is detected on an endpoint.

Of these value sources their perceived importance will vary greatly to the data’s customer. Lets talk about typical customers for a few minutes

- Legal – The legal team is one of the ultimate customers of the solution and often the most powerful agent of change in achieving funding. Conservative and often paranoid their goals are easily understood and testable. As such their primary concern in forensic value.
  - Retention – Their ask is to retain data for length of time required for greater of the following and no longer per log source. The standards are “business reason” meaning it is not correct to take the most demanding standard and apply to all things log.
    - The business to operate (SOC)
    - The requirements of contractually imposed standards such as PCI, HIPPA (BA) OR specific contract terms.
    - The requirements of legal standards. For example seven years in the case of change logs for financial controls where the electronic record is the sole control.
  - Availability – The original log form (not the original medium) must be available for discovery for the period of time required. Additionally unrelated log sources should not be commingled. If provided to a third party in discovery that additional information can be used against the organization in legal proceedings.
- Brand Protection/marketing – While a non consumer of the log information this group within your organization can indeed be a champion. Their desire is to be able to answer questions to consumers and the public. “What happened”, “When did it start”, “When did it end”. This group will derive value from both forensic and detection in the event of a breach. However the value of detective controls can be realized to avoid two major categorizes of events
  - Detection – Denial of service through intentional destruction of IT systems
  - Detection – Defacement such as loading of unauthorized text or media onto customer facing systems.
- Loss Prevention/Fraud/Corporate Security – Direct financial consequences of security events of today are often included inside this group today. External events will often trigger investigations which will require assistance from the IT security organization. Forensic log data easily produced on demand will improve the operation of this group.
- Human Resources – This group represents an excellent opportunity for partnership.
  - Detection – Policy violations and the organizations response when such events may rise to “resume updating” levels require methodical execution to avoid legal exposure.
  - Forensic – Records will permit rapid resolution of externally reported events such as workplace harassment.
- Compliance – This may take the form of multiple groups within the organization inside of other larger groups. In most cases value is taken from forensic usage of data. Compliance groups often initiate the funding log aggregation projects and can be significant partners in funding the Log Aggregation + SIEM solutions. For systems involved in the scope of a compliance program
  - Forensic – Data for the operation of the systems
  - Forensic – Data to evidence the performance of the SOC for events related to compliance systems.
- IT Security Systems Engineering SSE – This group often does not desire consolidated views of data. Objections are often centered on the “hear no evil see no evil” view point in that aggregated data will inform the team of opportunities which will require effort the teams are not staffed for. This objection can often be overcome by demonstration of “work smarter not harder” utilizing data driven decision making and prioritization.
  - Tuning – what systems generate the most noise
  - Tuning – what systems not log logging useful information
- IT Security Operations – This group can quickly be overwhelmed with a poorly planed SIEM implementation. Pre SIEM SOC teams will most often utilize alert by email from security tools such as endpoint anti malware and intrusion detection.
  - Tuning – evidence of miss-configuration in IT systems increasing risk through accepting of risky behavior or noise preventing identification of true positives.
  - Forensic – fast access to original events and context provided by assets and identities reduce the triage time and allow the organization to increase value from the existing staff.
  - Detection – Consolidation of Alerts from existing detection technology combined with work prioritization utilizing assets and identities. This critical capability allows the security operations team to reduce the burden of compliance by ensuring their process “exists and is followed” to work events based on the perceived significance. This is often the first value realized by this team and is often ignored in favor of “new capabilities”. This error can easily be said to cause the majority of SIEM project failures from the perspective of this team.
  - Detection – Utilization of the SIEM product capabilities to identify violation of policy and known bad behavior (rules based). Such events represent new knowledge of activities in the environment and can be of significant value provided the staff is available to execute. Effective execution of Tuning and Detection based on alerts will enable to organization to realize this value.
- IT Security Intelligence (SIC) and or hunt team – A relatively new group, often a person who’s charter is to pursue identification if risk and bad actors in the environment using new concepts outside of the burden of compliance. Then work with the SOC and SSE teams to operationalize valid detection. Additionally this team will often own the configuration of behavior analysis technology
  - Analytic – This team will slice dice and aggregate data looking for anomalies which often result in the creation of new rules based detection.
  - Forensic – This data is required to analyze the detected events for validation of positive vs false positive.

Given our end customers/consumers and organizational goals we can identify which log sources and SIEM capabilities will provide the greatest return on investment. To seed your initial discussion consider the following as a typical road map for value from data consumption. I order the data source based on my experience with value delivered to the organizations I have serviced. For any give source I can provide a full thesis on my position which would simply be to much to read in this post.

- Consolidation of data source useful for identification of authorized assets and identities. You can find more on this blog about specific approaches. Useful for Detection, Analytic, and Forensic
  - Networks owned.
  - Compute assets, endpoints, servers, storage
  - Other assets, switches routers, network appliances, UPS etc
  - System Service Accounts
  - Local Accounts (mapped to owners)
  - Humans
    - Elevated
    - Non Elevated
  - Application accounts
    - Built in
    - Service
    - Human
- Endpoint anti malware – Detection
- Network IDS – Detection
- Firewall – Detection, Forensic, Analytic
- Network Application (WebProxy, NG Firewall) Detection, Forensic, Analytic
- Endpoint intelligence (process launch context and hash) Forensic, Analytic
- Web Access logs for employee systems such as Exchange, SSO and HR portal. Detection, Analytic
- System Authentication logs.
- Customer facing web access logs

What should you do next? Use case development, is the process of identification of requirements for detection, matching source data to support the requirements and documenting a process to deliver and respond on the new capability. This should be continued until the organization observes the cost of obtaining additional value from existing logs exceeds the perceived value delivered. Larger organizations should allow use case development to identify future log sources, small to medium organizations should limit scope at avoid analysis paralysis. At the end of the day this approach will yield a slowing uptake on the size of your log aggregation and SIEM in the short term.

In the long term your system will have a lower TCO and grander scale.

![aRV5xnB_700b](https://i0.wp.com/www.rfaircloth.com/wp-content/uploads/2016/01/aRV5xnB_700b.jpg?resize=587%2C427)
